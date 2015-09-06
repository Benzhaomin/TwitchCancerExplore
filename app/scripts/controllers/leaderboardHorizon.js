'use strict';

/**
 * @ngdoc function
 * @name twitchCancer.controller:LeaderboardHorizonController
 * @description
 * # LeaderboardHorizonController
 * Controller of the header view
 */
angular.module('controllers.leaderboardHorizon', [])
  .controller('LeaderboardHorizonController', function($scope, $routeParams, $location, $window) {

    // returns true when an horizon is active
    $scope.isActive = function(horizon) {
      return horizon === $routeParams.leaderboardHorizon;
    };

  })
  .filter('horizon', function($filter) {
    return function(input) {
      if (input === "all") {
        return "All-time <small>Since August 25th 2015</small>";
      }
      else if (input === "monthly") {
        var date  = $filter('date')(new Date(), 'MMMM yyyy');

        return date;
      }
      else if (input === "daily") {
        var date  = $filter('date')(new Date(), 'shortDate');

        return "Today <small>"+date+"</small>";
      }

      return "Hu?!";
   };
  })
;
