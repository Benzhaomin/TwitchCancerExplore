'use strict';

/**
 * @ngdoc function
 * @name twitchCancer.controller:ChannelCtrl
 * @description
 * # ChannelCtrl
 * Controller of the channel view
 */
angular.module('controllers.channel', [])
  .controller('ChannelCtrl', ['$scope', '$routeParams',
    function($scope, $routeParams) {
      $scope.channelName = $routeParams.channelName;
    }
  ])
;
