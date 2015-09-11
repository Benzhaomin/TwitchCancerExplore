'use strict';

/**
 * @ngdoc function
 * @name twitchCancer.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the main view
 */
angular.module('controllers.main', ['directives.bubbleschart', 'api.websocket'])
  .controller('MainCtrl', function($scope, api) {

    api.subscribe("twitchcancer.live", function(json) {
      $scope.live = json;
    });

    $scope.$on("$destroy", function() {
      api.unsubscribe("twitchcancer.live");
    });
  })
;
