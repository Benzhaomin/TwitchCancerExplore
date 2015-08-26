'use strict';

/**
 * @ngdoc function
 * @name twitchCancer.directive:Leaderboard
 * @description
 * # Leaderboard
 * Directive used to render data as a leaderboard
 */
angular.module('directives.leaderboard', ['twitchProfile'])

  .directive('leaderboard', function() {
    return {
      restrict: 'E',
      replace: false,
      templateUrl : 'views/leaderboard.html',
      scope: {records: '=boardData', boardType: '@'}
    };
  })
;
