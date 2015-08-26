'use strict';

/**
 * @ngdoc function
 * @name twitchCancer.controller:ChannelCtrl
 * @description
 * # ChannelCtrl
 * Controller of the channel view
 */
angular.module('controllers.channel', ['api.websocket'])
  .controller('ChannelCtrl', function($scope, $routeParams, api) {
      $scope.channelName = $routeParams.channelName;

      api.subscribe("twitchcancer.channel.#"+$scope.channelName, function(json) {
        $scope.stats = json;
      });

      $scope.$on("$destroy", function() {
        api.unsubscribe("twitchcancer.channel.#"+$scope.channelName);
      });
    }
  )
;
