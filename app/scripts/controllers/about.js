'use strict';

/**
 * @ngdoc function
 * @name twitchCancer.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the about view
 */
angular.module('controllers.about', ['countTo', 'api.websocket'])
  .controller('AboutCtrl', function($scope, api) {

    api.subscribe("twitchcancer.status", function(json) {
      $scope.status = json;
    });

    $scope.$on("$destroy", function() {
      api.unsubscribe("twitchcancer.status");
    });

  })
;
