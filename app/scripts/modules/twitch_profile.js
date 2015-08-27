'use strict';

/**
 * @ngdoc overview
 * @name twitchprofile
 * @description
 * # Twitch.tv profiles loading and formatting.
 *
 * Util module.
 */
angular
  .module('twitchProfile', [
    'ui.bootstrap',
    'ngStorage'
  ])
  .factory('twitchProfiles', function($http, $localStorage, configuration) {

    // create the profiles collection on first load
    $localStorage.profiles = $localStorage.profiles || {};

    // return our local thumbnail URL
    var _thumbnail_url = function(logo_url) {
      if (configuration.thumbnailer !== "") {
        return configuration.thumbnailer + urlencode(logo_url);
      }
      else {
        return logo_url;
      }
    }

    var _default_logo = 'http://static-cdn.jtvnw.net/jtv_user_pictures/xarth/404_user_300x300.png';

    // load a channel using TwitchTV's API
    var _remote_load = function(channel) {

      $http.jsonp('https://api.twitch.tv/kraken/channels/'+channel+'?callback=JSON_CALLBACK').then(function(response) {
        $localStorage.profiles[channel] = response.data;

        // the default avatar is null
        if (!$localStorage.profiles[channel].logo) {
          $localStorage.profiles[channel].logo = _default_logo;
        }

        // store the URL to our local thumbnail
        $localStorage.profiles[channel].thumbnail = _thumbnail_url($localStorage.profiles[channel].logo);

        //console.log('[jsonp] finished loading ' + channel);
      }, function(err) {
        console.err('[jsonp] failed loading ' + channel + ' ' + err);

        delete $localStorage.profiles[channel];
      });
    };

    return {
      'load': function(channel) {
        // make sure whatever the caller asked ends-up using the same record
        channel = channel.replace('#', '');

        // new channel or empty local storage, time to load
        if (!(channel in $localStorage.profiles)) {
          // placeholder to return to watcher
          $localStorage.profiles[channel] = {
            "display_name": channel.replace('#', ''),
            'logo': _default_logo
          };

          // store the URL to our local thumbnail
          $localStorage.profiles[channel].thumbnail = _thumbnail_url($localStorage.profiles[channel].logo);

          // (async) load the channel's profile
          _remote_load(channel);
        }

        // might be incomplete, better $watch it
        return $localStorage.profiles[channel];
      }
    };
  })
  .directive('twitchprofile', function($http, twitchProfiles) {
    return {
      restrict: 'E',
      replace: false,
      scope: {
        channel: '@',
        title: '@',
        rank: '@'
      },
      templateUrl : 'views/twitch_profile.html',
      link: function(scope) {

        // ask the factory to load the profile and render the template when the profile is ready
        scope.$watch(function() {
            return twitchProfiles.load(scope.channel);
          },
          function(newValue) {
            if (newValue) {
              //console.log('[directive] profile loaded ' + scope.channel);
              scope.profile = newValue;
            }
          }
        );
      }
    };
  });
