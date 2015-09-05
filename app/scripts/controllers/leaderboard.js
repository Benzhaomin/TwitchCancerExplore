'use strict';

/**
 * @ngdoc function
 * @name twitchCancer.controller:LeaderboardCtrl
 * @description
 * # LeaderboardCtrl
 * Controller of the leaderboard view
 */
angular.module('controllers.leaderboard', ['api.websocket'])
  .controller('LeaderboardCtrl', function($scope, $routeParams, api) {
    $scope.leaderboardName = $routeParams.leaderboardName;

    var leaderboards = {
      'cancer.minute': {
        'title': "Cancer points in a minute",
        'decimals': 0,
      },
      'cancer.total': {
        'title': "Cancer points in total",
        'decimals': 0
      },
      'cancer.average': {
        'title': "Cancer points on average",
        'decimals': 2
      },
      'messages.minute': {
        'title': "Message count in a minute",
        'decimals': 0
      },
      'messages.total': {
        'title': "Message count in total",
        'decimals': 0
      },
      'messages.average': {
        'title': "Message count on average",
        'decimals': 2
      },
      'cpm.minute':  {
        'title': "Cancer per message in a minute",
        'decimals': 2
      },
      'cpm.total':  {
        'title': "Cancer per message in total",
        'decimals': 2
      }
    }

    $scope.title = leaderboards[$scope.leaderboardName].title;
    $scope.decimals = leaderboards[$scope.leaderboardName].decimals;

    api.subscribe("twitchcancer.leaderboard.all."+$scope.leaderboardName, function(json) {
      $scope.leaderboard = json;
    });

    $scope.$on("$destroy", function() {
      api.unsubscribe("twitchcancer.leaderboard.all."+$scope.leaderboardName);
    });
  })
;
