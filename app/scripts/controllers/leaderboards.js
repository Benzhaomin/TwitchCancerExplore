'use strict';

/**
 * @ngdoc function
 * @name twitchCancer.controller:LeaderboardsCtrl
 * @description
 * # LeaderboardsCtrl
 * Controller of the leaderboards view
 */
angular.module('controllers.leaderboards', ['directives.leaderboard', 'api.websocket'])
  .controller('LeaderboardsCtrl', function($scope, api) {

    api.subscribe("twitchcancer.leaderboards", function(json) {
      $scope.leaderboards = json;
    });

    $scope.$on("$destroy", function() {
      api.unsubscribe("twitchcancer.leaderboards");
    });
  })
;
