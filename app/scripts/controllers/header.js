'use strict';

/**
 * @ngdoc function
 * @name twitchCancer.controller:HeaderController
 * @description
 * # HeaderController
 * Controller of the header view
 */
angular.module('controllers.header', ['api.websocket'])
  .controller('HeaderController', function($scope, $location, $window, api) {

    // returns true when a path is active
    $scope.isActive = function(viewLocation) {
      // match a variable path
      if (viewLocation.indexOf("*") > 0) {
        return $location.path().indexOf(viewLocation.replace("*", "")) === 0;
      }
      // match an exact path
      else {
        return viewLocation === $location.path()
      }
    };

    // search for a channel based on its name
    $scope.search = function(val) {
      return api.request('twitchcancer.search', val)
      .then(function(response) {
        return response.map(function(elem) {
          return elem.replace("#", "");
        });
      });
    };

    // just go to whatever is in the search field
    $scope.submit = function() {
      $window.location.href = '#/channel/'+$scope.searched;
    };
  })
;
