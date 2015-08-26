'use strict';

/**
 * @ngdoc function
 * @name twitchCancer.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the main view
 */
angular.module('controllers.main', [])
  .controller('MainCtrl', function ($scope, $http, $websocket, configuration) {
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
  .directive('barsChart', function() {
    return {
      restrict: 'E',
      replace: false,
      scope: {data: '=chartData', field: '@chartField'},
      link: function (scope, element) {
        var chart = d3.select(element[0]).append("div").attr("class", "chart");
        var x = d3.scale.linear().range([0,99]);

        scope.$watch('data', function() {

          if (typeof scope.data === 'undefined') {
            //chart.text("Loading...");
            return;
          }
          /*else {
            chart.text('');
          }*/

          if (scope.data.len === 0) {
            chart.text("No data");
            return;
          }

          x.domain(d3.extent(scope.data, function(d) {
            return d[scope.field];
          }));

          var data = scope.data.sort(function(a, b) {
            return b[scope.field] - a[scope.field];
          }).slice(0,10);

          var div = chart.selectAll('div')
            .data(data);

          div.attr("class", "update")
            .transition().ease("elastic");

          div.enter().append("div")
            .attr("class", "enter");

          div.style("width", function(d) { return x(d[scope.field]) + "%"; })
            .text(function(d) { return d.channel + ": " + d[scope.field]; });
        });
      }
    };
   })
  .directive('bubblesChart', function(twitch_profiles) {
    return {
      restrict: 'E',
      replace: false,
      scope: {data: '=chartData', field: '@chartField'},
      link: function (scope, element) {
        var diameter = 530,
          format = d3.format(",d"),
          color = d3.scale.category20c();

        var bubble = d3.layout.pack()
          .sort(null)
          .size([diameter, diameter])
          .padding(1.5)
          .value(function(d) {
            return d[scope.field];
          });

        var last_update = new Date(1970);

        var chart = d3.select(element[0]).append("div").attr("class", "chart")
          .attr("class", "bubble");

        scope.$watch('data', function() {

          if (typeof scope.data === 'undefined') {
            //chart.text("Loading...");
            return;
          }
          /*else {
            chart.text('');
          }*/

          if (scope.data.len === 0) {
            chart.text("No data");
            return;
          }

          // only update bubbles every so often
          var now = new Date();
          if (now.getTime() - last_update.getTime() < 2000) {
            return;
          }
          else {
            last_update = now;
          }

          // sort descending
          var data = scope.data.sort(function(a, b) {
            return b[scope.field] - a[scope.field];
          }).slice(0,12);

          // load profile images
          data = data.map(function(value, index) {
            var profile = twitch_profiles.load(value.channel);

            if (profile) {
              value.logo = profile.logo;
              value.url = profile.url;
            }

            value.class = "rank-"+(index+1);

            return value;
          });

          // update data nodes
          var node = chart.selectAll(".node")
            .data(
              bubble.nodes({'children':data})
                .filter(function(d) { return !d.children; }),
              function(d) { return d.channel; }
            );

          // node enter
          var nodeEnter = node.enter()
            .append("a")
            .attr("target", "_blank")
            .attr("class", function(d) { return "node "+d.class; });

          var nodeEnterH4 = nodeEnter.append("div")
            .attr("class", "logo")
            .append("h4");

          nodeEnterH4
            .append("span");

          nodeEnterH4
            .append("br");

          nodeEnterH4
            .append("small")
            .text(function(d) { return d.channel; });

          // node update, with transition
          node
            .transition().duration(1000)
            .attr("style", function(d) {
              var style = "";

              style += "left:"+ Math.round(d.x-d.r)+"px;";
              style += "top:"+ Math.round(d.y-d.r)+"px;";

              return style;
            });

          // node update, without transition
          node
            .attr("class", function(d) { return "node "+d.class; })
            .attr("href", function(d) {
              if (typeof d.url === "undefined") {
                return "";
              }
              else {
               return d.url;
              }
            }).attr("title", function(d) {
              if (typeof d.url === "undefined") {
                return "";
              }
              else {
               return d.url;
              }
            });

          // update the size of the streamer logo
          node.select(".logo")
            .transition()
            .attr("style", function(d) {
              var style = "";

              style += "border-radius:"+Math.round(d.r)+"px;";
              style += "width:"+ 2*Math.round(d.r)+"px;";
              style += "height:"+ 2*Math.round(d.r)+"px;";

              if (typeof d.logo === "undefined") {
                style += "background:"+color(d.channel)+";";
              }
              else {
                style += " background:"+"url('"+d.logo+"') no-repeat left top "+color(d.channel)+"; background-size: cover;";
              }
              return style;
            });

          // update the main value
          node.select("h4").select("span")
            .text(function(d) { return format(d[scope.field]); });

          // node exit
          node.exit().remove();
        });
      }
    };
   })
  .directive('leaderboard', function() {
    return {
      restrict: 'E',
      replace: false,
      templateUrl : 'views/leaderboard.html',
      scope: {records: '=boardData', boardType: '@'}
    };
   })
;
