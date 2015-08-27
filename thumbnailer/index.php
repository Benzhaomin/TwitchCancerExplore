<?php

/**
 * Twitch Thumbnailer
 *
 * Serves thumbnails of Twitch profile images using gd and a local cache
 */

// configuration constants
define("GENERATED_DIR", dirname(__FILE__).DIRECTORY_SEPARATOR.'generated/'); // where thumbs are cached
define("THUMBNAIL_SIZE", 85); // size of thumbnails (square)
define("PROFILE_BASEURL", 'http://static-cdn.jtvnw.net/jtv_user_pictures/');
define("IMAGE_NAME_REGEXP", '`^(?:[\w]+\-profile_image\-[\d\w]+\-|xarth/404_user_)300x300\.(?:jpeg|png)$`'); // Twitch profile image URL pattern https://regex101.com/r/pJ2fC4/2

// "variable" constants, just to be a bit safer and make sure we won't screw anything up later
define("REMOTE_IMAGE", (isset($_GET['src']) ? $_GET['src'] : 'xarth/404_user_300x300.png'));
define("REMOTE_IS_PNG", preg_match("/png$/", REMOTE_IMAGE)); // Twitch stores png and jpg images
define("LOCAL_PATH", GENERATED_DIR.md5(REMOTE_IMAGE).(REMOTE_IS_PNG ? ".png" : ".jpg")); // build a local file path
define("REMOTE_URL", PROFILE_BASEURL.REMOTE_IMAGE); // get the URL of the REMOTE_URL profile image

// generate missing thumbnails
if (!file_exists(LOCAL_PATH)) {

  // make sure a Twitch profile URL was requested
  if (!preg_match(IMAGE_NAME_REGEXP, REMOTE_IMAGE)) {
    die("Invalid URL: ".REMOTE_IMAGE);
  }

  // load the big image from Twitch
  $original = (REMOTE_IS_PNG ? @imagecreatefrompng(REMOTE_URL) : @imagecreatefromjpeg(REMOTE_URL));

  if (!$original) {
    die("Thumbnail creation failed because we couldn't load the source image from Twitch");
  }

  // create a new image to put the thumbnail in
  $thumb = imagecreatetruecolor(THUMBNAIL_SIZE, THUMBNAIL_SIZE);

  if (REMOTE_IS_PNG) {
    imagecolortransparent($thumb, imagecolorallocatealpha($thumb, 0, 0, 0, 127));
  }

  imagealphablending($thumb, !REMOTE_IS_PNG);
  imagesavealpha($thumb, REMOTE_IS_PNG);

  // resize
  imagecopyresized($thumb, $original, 0, 0, 0, 0, THUMBNAIL_SIZE, THUMBNAIL_SIZE, imagesx($original), imagesy($original));

  // save locally
  if (!is_dir(GENERATED_DIR)) {
    if (!@mkdir(GENERATED_DIR, 0755, true)) {
      die("We couldn't create a cache folder for you, try with `mkdir -p ".GENERATED_DIR."'.");
    }
  }

  if (!is_writable(GENERATED_DIR)) {
    die("You need to give write access on ".GENERATED_DIR." to the php/web server process.");
  }

  if (REMOTE_IS_PNG) {
    imagepng($thumb, LOCAL_PATH);
  }
  else {
    imagejpeg($thumb, LOCAL_PATH);
  }
}

// check for 304s
if (isset($_SERVER['HTTP_IF_MODIFIED_SINCE']) and filemtime(LOCAL_PATH) == strtotime($_SERVER['HTTP_IF_MODIFIED_SINCE'])) {
  header('HTTP/1.1 304 Not Modified');
  header('Connection: close');
  exit(0);
}

// never expire
session_cache_limiter(false);
header('Expires: Sun, 24 Aug 2025 16:46:41 GMT');
header('Cache-Control: public');
header('Last-Modified: '.gmdate('D, d M Y H:i:s', filemtime(LOCAL_PATH)).' GMT');

header('Content-Type: '.(REMOTE_IS_PNG ? "image/png" : "image/jpeg"));

// we're trusting that the cache folder only contains stuff we generated ourselves
// we might be serving whatever else ended up in there thanks to a weird admin or a kind hacker

readfile(LOCAL_PATH);
exit(0);
