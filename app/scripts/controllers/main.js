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
      $scope.live = json.map(function(value) {
        // compute cancer per message
        value.cpm = Math.round(value.cancer / value.messages * 100)/100;
        return value;
      });
    });

    $scope.$on("$destroy", function() {
      api.unsubscribe("twitchcancer.live");
    });

    $scope.cancerPopover = {
      templateUrl: 'cancer-info-popover.html',
    };
  })
;
