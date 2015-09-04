'use strict';

/**
 * @ngdoc function
 * @name twitchCancer.controller:HeaderController
 * @description
 * # HeaderController
 * Controller of the header view
 */
angular.module('controllers.header', [])
  .controller('HeaderController', function($scope, $location) {
    $scope.isActive = function(viewLocation) {
      // match a variable path
      if (viewLocation.indexOf("*") > 0) {
        return $location.path().indexOf(viewLocation.replace("*", "")) === 0;
      }
      // match an exact path
      else {
        return viewLocation === $location.path()
      }
    };
  })
;
