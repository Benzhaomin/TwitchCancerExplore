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
      return viewLocation === $location.path();
    };
  })
;
