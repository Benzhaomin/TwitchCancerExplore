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
  .factory('twitchProfiles', function($http, $localStorage, $q, configuration) {

    // create the profiles collection on first load
    $localStorage.profiles = $localStorage.profiles || {};

    var _base_picture_url =  'https://static-cdn.jtvnw.net/jtv_user_pictures/';
    var _default_logo = _base_picture_url +'xarth/404_user_300x300.png';

    // holds promises while profile are loading
    var _loading = {};

    // return our local thumbnail URL
    var _thumbnail_url = function(logo_url) {
      if (configuration.thumbnailer !== "") {
        return configuration.thumbnailer + encodeURIComponent(logo_url.replace(_base_picture_url, ""));
      }
      else {
        return logo_url;
      }
    };

    // returns a default profile for a channel, without loading stuff from Twitch
    var lazy_load = function(channel) {
      channel = channel.replace('#', '');

      // return what we actually have if the profile is already there
      if (channel in $localStorage.profiles) {
        return $localStorage.profiles[channel];
      }

      var profile = {
        "name": channel,
        "display_name": channel,
        'logo': _default_logo
      };

      // local thumbnail of the default logo for now
      profile.thumbnail = _thumbnail_url(profile.logo);

      return profile;
    };

    // load a channel using TwitchTV's API
    var _remote_load = function(channel) {
      var deferred = $q.defer();

      // placeholder for new channels until we really load them
      if (!(channel in $localStorage.profiles)) {
        $localStorage.profiles[channel] = lazy_load(channel);
      }

      // hack
      deferred.promise.then( null, null, angular.noop );

      // notify with stale data for now
      deferred.notify($localStorage.profiles[channel]);

      // we will be loading this channel in a second
      _loading[channel] = deferred.promise;

      $http({
        method: 'GET',
        url: 'https://api.twitch.tv/kraken/search/channels',
        headers: {
          'Accept': 'application/vnd.twitchtv.v5+json',
          'Client-ID': configuration.clientid
        },
        params: {
          query: channel
        }
      }).then(function(response) {
        var channel_data = null;
        for (var i=0; i < response.data.channels.length; i++) {
          if (response.data.channels[i].name === channel) {
            channel_data = response.data.channels[i];
            break;
          }
        }

        if (!channel_data) {
          delete _loading[channel];
          delete $localStorage.profiles[channel];
          //console.error('failed to find channel ' + channel);
          //deferred.reject('failed to find channel ' + channel);
          return;
        }

        var profile = $localStorage.profiles[channel];

        // fill the local profile up
        profile.channel_id = channel_data._id;
        profile.display_name = channel_data.display_name;
        profile.description = channel_data.description;
        profile.status = channel_data.status;
        profile.logo = channel_data.logo || _default_logo;
        profile.logo = profile.logo.replace("http://", "https://");
        profile.thumbnail = _thumbnail_url(profile.logo);
        profile.url = channel_data.url;
        profile.followers = channel_data.followers;
        profile.game = channel_data.game;
        profile.cachedAt = Date();

        //console.log('finished loading ' + channel);
        deferred.resolve(profile);
      }, function() {
        delete _loading[channel];
        delete $localStorage.profiles[channel];
        //console.error('failed to find channel ' + channel);
        //deferred.reject('failed to find channel ' + channel);
      });

      return deferred.promise;
    };

    // expire profile after 24 hours
    var _cache_expired = function(profile) {
      return Date.now() - new Date(profile.cachedAt).getTime() > 24 * 60 * 60 * 1000;
    };

    // returns a promise that resolves to the profile object
    var load = function(channel, freshPls) {

      // ignore IRC channel # sign if the caller had one in
      channel = channel.replace('#', '');

      // new channel or empty local storage, time to load
      if (!(channel in $localStorage.profiles)) {
        return _remote_load(channel);
      }
      // existing channel, might already be loading
      else if (channel in _loading) {
        return _loading[channel];
      }
      // if we want fresh data and have old data, time to reload
      else if (freshPls === true && _cache_expired($localStorage.profiles[channel])) {
        return _remote_load(channel);
      }

      // return the current value as a resolved promise
      return $q.when($localStorage.profiles[channel]);
    };

    // public API
    return {
      'load': load,
      'lazy_load': lazy_load
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
      templateUrl : 'views/parts/twitch_profile.html',
      link: function(scope) {

        var on_profile_loaded = function(profile) {
          scope.profile = profile;
        };

        // request a profile load, wait for both resolve and notify
        twitchProfiles.load(scope.channel)
          .then(on_profile_loaded, null, on_profile_loaded);
      }
    };
  });
