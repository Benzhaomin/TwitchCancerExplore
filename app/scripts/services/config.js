'use strict';

angular.module('services.config', [])
  .constant('configuration', {
    api_socket: 'ws://localhost:8080'
  });
