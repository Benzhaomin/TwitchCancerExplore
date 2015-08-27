'use strict';

/**
 * @ngdoc function
 * @name twitchCancer.directive:BubblesChart
 * @description
 * # BubblesChart
 * Directive used to render data as a bubbles chart
 */
angular.module('directives.bubbleschart', ['twitchProfile'])
  .directive('bubblesChart', function(twitchProfiles) {
    return {
      restrict: 'E',
      replace: false,
      scope: {data: '=chartData', field: '@chartField'},
      link: function (scope, element) {
        var diameter = 900,
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

        // add a [top20 - top100] switch
        var showAll = false;

        chart
          .append("button")
          .attr("class", "btn btn-danger pull-right")
          .style("outline", "0 none")
          .attr("title", "Show all streams, stronk cpu pls")
          .attr("data-toggle", "button")
          .text("Man mode")
          .on("click", function() {
            showAll = !showAll;

            /*if (showAll) {
              d3.select(this).attr("class", "btn on")
            }
            else {
              d3.select(this).attr("class", "btn off")
            }*/

            updateChart(true);
          });

        // will update all bubbles based on scope.data
        var updateChart = function(noDelay) {

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

          if (noDelay === false) {
            // update as soon as we get data when on top 10 mode
            noDelay = !showAll;
          }

          if (!noDelay && now.getTime() - last_update.getTime() < 4000) {
            return;
          }
          else {
            last_update = now;
          }

          // sort descending
          var data = scope.data.sort(function(a, b) {
            return b[scope.field] - a[scope.field];
          });

          // only display the top 20
          if (!showAll) {
            data = data.slice(0, 20);
          }

          // load profile images
          data = data.map(function(value, index) {
            var profile = twitchProfiles.load(value.channel);

            // this might be default data but that's fine
            value.logo = profile.logo;
            value.display_name = profile.display_name;

            // add a rank-specific class
            value.class = "rank-"+(index+1);

            // remove the IRC #
            value.channel = value.channel.replace("#", "");

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
            .attr("title", "open channel profile (in this tab)")
            .attr("class", function(d) { return "node "+d.class; });

          var nodeEnterH4 = nodeEnter.append("div")
            .attr("class", "logo")
            .style("background", function(d) {
              return "no-repeat left top "+color(d.channel);
            })
            .append("h4");

          nodeEnterH4
            .append("span");

          nodeEnterH4
            .append("br");

          nodeEnterH4
            .append("small");

          // node update, with transition
          node
            .transition().duration((showAll ? 2000 : 990))
            .style("left", function(d) {
              return Math.round(d.x-d.r)+"px";
            })
            .style("top", function(d) {
              return Math.round(d.y-d.r)+"px";
            });

          // node update, without transition
          node
            .attr("class", function(d) { return "node "+d.class; })
            .attr("href", function(d) {
              return "/#/channel/"+d.channel;
            });

          // update the streamer's logo
          node.select(".logo")
            .style('background-image', function(d) {
                if (typeof d.logo === "undefined") {
                  return "";
                }
                else {
                  return 'url("'+d.logo+'")';
                }
            })
            .style('background-size', 'cover');

          // update the size of the streamer logo
          node.select(".logo")
            .transition()
            .style("border-radius", function(d) {
              return Math.round(d.r)+"px";
            })
            .style("width", function(d) {
              return 2*Math.round(d.r)+"px";
            })
            .style("height", function(d) {
              return 2*Math.round(d.r)+"px";
            });

          // update the main value, without transition
          node.select("h4").select("span")
            .text(function(d) { return format(d[scope.field]); });

          // update the main value, with transition
          node.select("h4").select("span")
            .style("font-size", function(d) {
              return +d.r/30+"em";
            });

          // update the streamer's name, without transition
          node.select("h4").select("small")
            .text(function(d) { return ("display_name" in d ? d.display_name : d.channel); });

          // update the streamer's name, with transition
          node.select("h4").select("small")
            .style("font-size", function(d) {
              return +d.r/80+"em";
            });

          // node exit
          node.exit().remove();
        };

        scope.$watch('data', function() { updateChart(false) });
      }
    };
  })
;
