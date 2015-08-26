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
  .factory('twitch_profiles', function($http, $localStorage) {

    // create the profiles collection on first load
    $localStorage.profiles = $localStorage.profiles || {};

    // load a channel using TwitchTV's API
    var _remote_load = function(channel) {

      $http.jsonp('https://api.twitch.tv/kraken/channels/'+channel.replace('#', '')+'?callback=JSON_CALLBACK').then(function(response) {
        $localStorage.profiles[channel] = response.data;

        // the default avatar is null
        // TODO: default values for other nullable fields
        if (!$localStorage.profiles[channel].logo) {
          $localStorage.profiles[channel].logo = 'http://static-cdn.jtvnw.net/jtv_user_pictures/xarth/404_user_300x300.png';
        }
        //console.log('[jsonp] finished loading ' + channel);
      }, function(err) {
        console.err('[jsonp] failed loading ' + channel + ' ' + err);

        delete $localStorage.profiles[channel];
      });
    };

    return {
      'load': function(channel) {
        // new channel or empty local storage, time to load
        if (!(channel in $localStorage.profiles)) {
          // placeholder to return to watcher
          $localStorage.profiles[channel] = null;

          // (async) load the channel's profile
          _remote_load(channel);
        }

        // might be null, better $watch it
        return $localStorage.profiles[channel];
      }
    };
  })
  .directive('twitchprofile', function($http, twitch_profiles) {
    return {
      restrict: 'E',
      replace: false,
      scope: {
        channel: '@',
        title: '@'
      },
      templateUrl : 'views/twitch_profile.html',
      link: function(scope) {

        // ask the factory to load the profile and render the template when the profile is ready
        scope.$watch(function() {
            return twitch_profiles.load(scope.channel);
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
