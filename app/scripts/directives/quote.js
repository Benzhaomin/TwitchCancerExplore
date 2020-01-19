'use strict';

/**
 * @ngdoc function
 * @name twitchCancer.directive:Quote
 * @description
 * # Quote
 * Directive used to render data a quote
 */
angular.module('directives.quote', ['services.quotes'])

  .directive('quote', function(quotes) {
    return {
      restrict: 'E',
      replace: false,
      templateUrl : 'views/parts/quote.html',
      scope: {
        tags: '='
      },
      link: function(scope) {
        quotes.random(scope.tags).then(function(data) {
          scope.quote = data.quote;
          scope.author = data.author;
          scope.url = (data.channel !== "" ? "#/channel/"+data.channel : "");
        });
      }
    };
  })
;
