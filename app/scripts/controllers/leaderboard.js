'use strict';

/**
 * @ngdoc function
 * @name twitchCancer.controller:LeaderboardCtrl
 * @description
 * # LeaderboardCtrl
 * Controller of the leaderboard view
 */
angular.module('controllers.leaderboard', ['directives.quote', 'api.websocket'])
  .controller('LeaderboardCtrl', function($scope, $routeParams, $sce, api) {
    $scope.leaderboardName = $routeParams.leaderboardName;
    $scope.leaderboardHorizon = $routeParams.leaderboardHorizon;

    var leaderboards = {
      'cancer.minute': {
        'title': "Cancer Points <small>in a minute</small>",
        'decimals': 0,
      },
      'cancer.total': {
        'title': "Cancer Points <small>in total</small>",
        'decimals': 0
      },
      'cancer.average': {
        'title': "Cancer Points <small>on average</small>",
        'decimals': 0
      },
      'messages.minute': {
        'title': "Message Count <small>in a minute</small>",
        'decimals': 0
      },
      'messages.total': {
        'title': "Message Count <small>in total</small>",
        'decimals': 0
      },
      'messages.average': {
        'title': "Message Count <small>on average</small>",
        'decimals': 0
      },
      'cpm.minute':  {
        'title': "Cancer Per Message <small>in a minute</small>",
        'decimals': 2
      },
      'cpm.total':  {
        'title': "Cancer Per Message <small>in total</small>",
        'decimals': 2
      }
    }

    $scope.title = leaderboards[$scope.leaderboardName].title;
    $scope.decimals = leaderboards[$scope.leaderboardName].decimals;

    api.subscribe("twitchcancer.leaderboard."+$scope.leaderboardHorizon+"."+$scope.leaderboardName, function(json) {
      $scope.leaderboard = json;
    });

    $scope.$on("$destroy", function() {
      api.unsubscribe("twitchcancer.leaderboard."+$scope.leaderboardHorizon+"."+$scope.leaderboardName);
    });
  })
;
