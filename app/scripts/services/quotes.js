'use strict';

/**
 * @ngdoc function
 * @name twitchCancer.services:Quotes
 * @description
 * # Quotes
 * Provider of quotes
 */
angular.module('services.quotes', [])
  .factory('quotes', function($http) {

    var _get_quotes = function() {
      return $http.get('/quotes.json', {'cache': true}).
        then(function(response) {
          return response.data;
        }, function(response) {
          return [];
        });
    };

    var _filter_quotes = function(quotes, tags) {

      if (typeof tags !== "undefined") {

        // filter by tags
        quotes = quotes.filter(function(elem) {

          // we need all tags to be there
          return !tags.some(function(tag) {
            return elem.tags.indexOf(tag) === -1;
          });
        });
      }

      return quotes;
    };

    // returns a promise on a random quote
    var _random = function(tags) {

      return _get_quotes().then(function(quotes) {
        quotes = _filter_quotes(quotes, tags);

        // return a nice default quote
        if (quotes.length === 0) {
          return {/*
            "quote": This is not a quote",
            "author": "Robot",
            "channel": ""*/
          };
        }

        // return one of the quotes at random
        var index = Math.floor(Math.random() * quotes.length);

        return quotes[index];
      });
    };

    return {
      'random': _random,
    };
  })
;
