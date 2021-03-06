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
    'ngRoute',
    'ngWebSocket',
    'ngSanitize',
    'ui.bootstrap',
    'controllers.main',
    'controllers.about',
    'controllers.leaderboard',
    'controllers.leaderboards',
    'controllers.leaderboardHorizon',
    'controllers.channel',
    'controllers.header',
    'controllers.cure',
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
      .when('/cure', {
        templateUrl: 'views/cure.html',
        controller: 'CureCtrl',
        controllerAs: 'cure'
      })
      .when('/leaderboards/:leaderboardHorizon', {
        templateUrl: 'views/leaderboards.html',
        controller: 'LeaderboardsCtrl',
        controllerAs: 'leaderboards'
      })
      .when('/leaderboard/:leaderboardName/:leaderboardHorizon', {
        templateUrl: 'views/leaderboard.html',
        controller: 'LeaderboardCtrl',
        controllerAs: 'leaderboard'
      })
      .when('/channel/:channelName', {
        templateUrl: 'views/channel.html',
        controller: 'ChannelCtrl',
        controllerAs: 'channel'
      })
      .otherwise({
        redirectTo: '/'
      });
  })
  .config(function ($compileProvider, configuration) {
    $compileProvider.debugInfoEnabled(configuration.debug === 'true');
  })
  .config(function($sceDelegateProvider) {
    $sceDelegateProvider.resourceUrlWhitelist([
      'self',
      'https://api.twitch.tv/kraken/**'
    ]);
  })
;
