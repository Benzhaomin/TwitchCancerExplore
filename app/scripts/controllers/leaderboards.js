'use strict';

/**
 * @ngdoc function
 * @name twitchCancer.controller:LeaderboardsCtrl
 * @description
 * # LeaderboardsCtrl
 * Controller of the leaderboards view
 */
angular.module('controllers.leaderboards', ['directives.leaderboard', 'api.websocket'])
  .controller('LeaderboardsCtrl', function($scope, $routeParams, api) {
    $scope.leaderboardHorizon = $routeParams.leaderboardHorizon;

    api.subscribe("twitchcancer.leaderboards."+$scope.leaderboardHorizon, function(json) {
      $scope.leaderboards = json;
    });

    $scope.$on("$destroy", function() {
      api.unsubscribe("twitchcancer.leaderboards."+$scope.leaderboardHorizon);
    });
  });
;
