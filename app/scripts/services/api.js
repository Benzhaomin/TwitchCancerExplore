'use strict';

angular.module('api.websocket', [])
  .factory('api', function($websocket, $q, configuration) {

    // store a list of topic subscribed to and their associated callback
    var subscriptions = {};

    // store a list of deferred responses
    var requests = {};

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
        subscriptions[json.topic](json.data);
      }
      else if(json.topic in requests) {
        requests[json.topic](json.data);
        delete requests[json.topic];
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

    var request = function(topic, data) {
      // don't send unless we know we're getting somewhere
      if (socket.readyState === 1) {
        var defer = $q.defer();

        // the promise will resolve when we get an answer for this request
        requests[topic] = function(data) {
          defer.resolve(data);
        };

        // send the request now
        socket.send('{"request": "'+topic+'", "data": "'+data+'"}');

        return defer.promise;
      }
    };

    return {
      'subscribe': subscribe,
      'unsubscribe': unsubscribe,
      'request': request
    };
  })
;
