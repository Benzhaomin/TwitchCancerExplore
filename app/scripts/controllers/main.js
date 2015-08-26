'use strict';

/**
 * @ngdoc function
 * @name twitchCancer.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the main view
 */
angular.module('controllers.main', ['directives.bubbleschart', 'directives.leaderboard'])
  .controller('MainCtrl', function ($scope, $websocket, configuration) {
    var socket = $websocket(configuration.api_socket);
    socket.reconnectIfNotNormalClose = true;

    socket.onMessage(function(message) {
      var json = JSON.parse(message.data);
      //console.log(message);

      if (json.topic === "twitchcancer.live") {
        $scope.live = json.data.map(function(value) {
          // compute cancer per message
          value.cpm = Math.round(value.cancer / value.messages * 100)/100;
          return value;
        });
      }
      else if (json.topic === "twitchcancer.leaderboards") {
        $scope.leaderboards = json.data;
      }
    });

    socket.onOpen(function() {
      //console.log('socket opened');

      socket.send('{"subscribe": "twitchcancer.live"}');
      socket.send('{"subscribe": "twitchcancer.leaderboards"}');
    });

    socket.onClose(function() {
      console.warn('socket closed');
    });

    socket.onError(function(error) {
      console.error(error);
    });
  })
;
