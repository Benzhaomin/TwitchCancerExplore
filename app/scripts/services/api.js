'use strict';

angular.module('api.websocket', [])
  .factory('api', function($websocket, configuration) {

    // store a list of topic subscribed to and their associated callback
    var subscriptions = {};

    var socket = $websocket(configuration.api_socket);

    socket.reconnectIfNotNormalClose = true;

    // onOpen
    socket.onOpen(function() {
      //console.log('socket opened '+configuration.api_socket);

      for (var topic in subscriptions) {
        socket.send('{"subscribe": "'+topic+'"}');
        //console.log("subscribed to "+topic);
      }
    });

    // onClose
    socket.onClose(function() {
      console.warn('socket closed');
    });

    // onError
    socket.onError(function(error) {
      console.error(error);
    });

    // onMessage
    socket.onMessage(function(message) {
      //console.log(message);

      var json = JSON.parse(message.data);

      if (json.topic in subscriptions) {
        //console.log("calling callback for " + json.topic);
        subscriptions[json.topic](json.data);
      }
      else {
        console.error("got data we don't want: " + json.topic);
      }
    });

    var subscribe = function(topic, callback) {
      if (topic in subscriptions) {
        return;
      }
      subscriptions[topic] = callback;

      // don't send unless we know we're getting somewhere
      if (socket.readyState === 1) {
        socket.send('{"subscribe": "'+topic+'"}');
        //console.log("subscribed to "+topic);
      }
    };

    var unsubscribe = function(topic) {
      if (!(topic in subscriptions)) {
        return;
      }
      //console.log("unsubscribed from "+topic);
      delete subscriptions[topic];

      socket.send('{"unsubscribe": "'+topic+'"}');
    };

    return {
      'subscribe': subscribe,
      'unsubscribe': unsubscribe
    };
  })
;
