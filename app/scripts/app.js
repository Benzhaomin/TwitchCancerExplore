'use strict';

/**
 * @ngdoc overview
 * @name twitchcancer
 * @description
 * # Live monitoring of Twitch chats cancer level via web-sockets.
 *
 * Main module of the application.
 */
angular
  .module('twitchCancer', [
    'ngAnimate',
    'ngCookies',
    'ngMessages',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'ngWebSocket',
    'ui.bootstrap',
    'controllers.main',
    'controllers.about',
    'controllers.leaderboards',
    'controllers.channel',
    'services.config'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl',
        controllerAs: 'main'
      })
      .when('/about', {
        templateUrl: 'views/about.html',
        controller: 'AboutCtrl',
        controllerAs: 'about'
      })
      .when('/leaderboards', {
        templateUrl: 'views/leaderboards.html',
        controller: 'LeaderboardsCtrl',
        controllerAs: 'leaderboards'
      })
      .when('/channel/:channelName', {
        templateUrl: 'views/channel.html',
        controller: 'ChannelCtrl',
        controllerAs: 'channel'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
