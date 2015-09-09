'use strict';

/**
 * @ngdoc function
 * @name twitchCancer.controller:ChannelCtrl
 * @description
 * # ChannelCtrl
 * Controller of the channel view
 */
angular.module('controllers.channel', ['countTo', 'ordinal', 'api.websocket', 'directives.quote', 'twitchProfile'])
  .controller('ChannelCtrl', function($scope, $routeParams, $sce, api, twitchProfiles) {
    $scope.channelName = $routeParams.channelName;

    var on_profile_loaded = function(profile) {
      $scope.profile = profile;

      // Twitch doesn't support https here :(
      $scope.chat_url = $sce.trustAsResourceUrl("http://www.twitch.tv/"+profile+"/chat");
    };

    $scope.showChat = false;

    // request a profile load, wait for both resolve and notify
    twitchProfiles.load($scope.channelName, true)
      .then(on_profile_loaded, null, on_profile_loaded);

    api.subscribe("twitchcancer.channel.#"+$scope.channelName, function(json) {
      $scope.stats = json;
    });

    $scope.$on("$destroy", function() {
      api.unsubscribe("twitchcancer.channel.#"+$scope.channelName);
    });
  })
  .directive('rankBadge', function() {
    return {
      restrict: 'A',
      replace: true,
      scope: {
        rank: '='
      },
      template: '<span class="badge rank-{{rank}}">{{rank | ordinal}}</span>'
    };
  })
  .directive('channelStats', function() {
    return {
      restrict: 'E',
      replace: false,
      templateUrl : 'views/parts/channel_stats.html',
      scope: {
        stats: '=',
        metric: '@',
        metricTitle: '@',
        metricName: '@'
      }
    };
  })
  .directive('metricStats', function() {
    return {
      restrict: 'E',
      replace: false,
      templateUrl : 'views/parts/metric_stats.html',
      scope: {
        stats: '=',
        metric: '=',
        metricName: '='
      }
    };
  })
;
