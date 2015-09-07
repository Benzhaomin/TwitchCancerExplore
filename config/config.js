'use strict';

angular.module('services.config', [])
  .constant('configuration', {
    api_socket: '@@api_socket',
    thumbnailer: '@@thumbnailer',
    debug: '@@debug'
  });
