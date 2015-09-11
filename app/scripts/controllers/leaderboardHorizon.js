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
    return function(input, anchor) {
      // default to not linking
      if (typeof anchor === "undefined") {
        anchor = false;
      }

      // transforms an horizon value to a detailed text
      var to_text = function(horizon) {
        if (horizon === "all") {
          var date  = $filter('date')(new Date("2015-08-25"), 'MM/yyyy', 'UTC');

          return "All-time <small>Since "+date+"</small>";
        }
        else if (horizon === "monthly") {
          var date  = $filter('date')(new Date(), 'MMMM yyyy', 'UTC');

          return "This month <small>"+date+"</small>";
        }
        else if (horizon === "daily") {
          var date  = $filter('date')(new Date(), 'shortDate', 'UTC');

          return "Today <small>"+date+"</small>";
        }

        return "Hu?!";
      }

      // wrap some html into a link to the leaderboards of an horizon
      var in_link = function(horizon, html, anchor) {
        return '<a href="#/leaderboards/'+horizon+'#'+anchor+'">'+ html +'</a>';
      }

      var text = to_text(input);

      if (anchor) {
        return in_link(input, text, anchor);
      }
      else {
        return text;
      }
   };
  })
;
