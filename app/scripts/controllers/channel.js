'use strict';

/**
 * @ngdoc function
 * @name twitchCancer.controller:ChannelCtrl
 * @description
 * # ChannelCtrl
 * Controller of the channel view
 */
angular.module('controllers.channel', ['countTo', 'ordinal', 'api.websocket', 'twitchProfile'])
  .controller('ChannelCtrl', function($scope, $routeParams, api, twitch_profiles) {
    $scope.channelName = $routeParams.channelName;

    $scope.$watch(function() {
        return twitch_profiles.load($scope.channelName);
      },
      function(newValue) {
        if (newValue) {
          $scope.profile = newValue;
        }
      }
    );

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
    }
  })
;
