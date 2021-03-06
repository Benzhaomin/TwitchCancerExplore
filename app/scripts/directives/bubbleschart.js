'use strict';

/**
 * @ngdoc function
 * @name twitchCancer.directive:BubblesChart
 * @description
 * # BubblesChart
 * Directive used to render data as a bubbles chart
 */
angular.module('directives.bubbleschart', ['directives.bubblechart.bubble'])
  .directive('bubblesChart', function(Bubble) {
    return {
      restrict: 'E',
      replace: true,
      scope: {data: '=chartData', field: '@chartField'},
      link: function (scope, element) {
        var diameter = 950;

        var bubble_pack = d3.layout.pack()
          .sort(null)
          .size([diameter, diameter])
          .padding(1.5)
          .value(function(d) {
            return d[scope.field];
          });

        // never updated yet
        var last_update = new Date(1970);

        // cache bubbles data
        scope.bubbles = {};

        scope.bubble = function(d) {
          if (d.channel in scope.bubbles) {
            return scope.bubbles[d.channel];
          }
          return null;
        };

        // add a [top15 - top100] button
        var showAll = false;
        var updateChart = null;

        d3.select(element[0])
          .append("button")
          .attr("class", "btn btn-danger pull-right man-mode")
          .attr("title", "Show all streams, stronk cpu pls")
          .attr("data-toggle", "button")
          .text("Man mode")
          .on("click", function() {
            showAll = !showAll;

            updateChart(true);
          });

        // add the main svg element
        var chart = d3.select(element[0])
          .append("div")
          .attr("class", "bubbles-chart") // scaled down on smaller devices
          .append("svg")
          .attr("width", 950)
          .attr("height", 950)
          .attr("class", "bubbles"); // fixed size to keep everything relative

        // add svg definitions
        var defs = chart.append("defs");

        // main path to turn rectangles into circles
        defs.append("clipPath")
          .attr("id", "roundPath")
          .append("circle")
          .attr("cx", 0)
          .attr("cy", 0)
          .attr("r", 50);

        // circle path used to clip the bottom of the image to fake a rounded border
        defs.append("clipPath")
          .attr("id", "roundBorderPath")
          .append("circle")
          .attr("cx", 0)
          .attr("cy", -5)
          .attr("r", 52);

        // add a (hidden) download link
        d3.select(element[0])
          .append("a")
          .attr("class", "pull-right")
          .style("margin-top", "-100px")
          .style("color", "white")
          .text("Download")
          .on("mouseover", function() {
            var serializer = new XMLSerializer();
            var xmlString = serializer.serializeToString(chart.node());
            var imgData = 'data:image/svg+xml;base64,' + btoa(xmlString);

            d3.select(this)
              .attr("download", "chart.svg")
              .attr("href-lang", "image/svg+xml")
              .attr("href", imgData);
          });

        var showNodeValue = function(node) {
          var text = node.select("text.value");

          if (text.size() === 0) {
            text = node.append("text")
              .attr("class", "value")
              .attr("fill", "white")
              .attr("text-anchor", "middle")
              .attr("dy", "1em")
              .attr("style", 
                "font-weight: bold;" +
                "font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif;" +
                "font-variant: small-caps;" +
                "font-size: 28px;" +
                "text-shadow: 0 0 1px black, 0 0 3px black, 0 0 4px black;" +
                "pointer-events: none;");
          }

          return text;
        };

        var hideNodeValue = function(node, force) {
          if (force && node.attr('data-hover') !== "true") {
            node.select("text.value").remove();
          }
        };

        var showNodeChannel = function(node) {
          var text = node.select("text.channel");

          if (text.size() === 0) {
            text = node.append("text")
              .attr("class", "channel")
              .attr("fill", "white")
              .attr("text-anchor", "middle")
              .attr("dy", "4.2em")
              .attr("style", 
                "font-weight: bold;" +
                "font-variant: small-caps;" +
                "font-size: 8.4px;" +
                "font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif;" +
                "text-shadow: 0 0 1px black, 0 0 3px black, 0 0 4px black;" +
                "pointer-events: none;");
          }

          return text;
        };

        var hideNodeChannel = function(node, force) {
          if (force && node.attr('data-hover') !== "true") {
            node.select("text.channel").remove();
          }
        };

        // will update all bubbles based on scope.data
        updateChart = function(noDelay) {

          if (typeof scope.data === 'undefined') {
            // Loading...
            return;
          }

          if (scope.data.length === 0) {
            // No data => no bubbles to show
            return;
          }

          // only update bubbles every so often
          var now = new Date();

          if (noDelay === false) {
            // update as soon as we get data when on top 10 mode
            noDelay = showAll;
          }

          if (!noDelay && now.getTime() - last_update.getTime() < 3000) {
            return;
          }
          else {
            last_update = now;
          }

          // sort descending
          var data = scope.data.sort(function(a, b) {
            return b[scope.field] - a[scope.field];
          });

          // only display the top 15
          if (!showAll) {
            data = data.slice(0, 15);
          }

          // create/update bubbles with that new data
          data = data.map(function(d, i) {
            var bubble;

            d.channel = d.channel.replace("#", "");

            // create new bubbles
            if (!scope.bubble(d)) {
              bubble = new Bubble(d.channel);

              // store that bubble
              scope.bubbles[d.channel] = bubble;
            }
            // re-use existing bubbles
            else {
              bubble = scope.bubble(d);
            }

            // update bubbles data
            bubble.datum = d[scope.field];
            bubble.rank = i+1;

            return d;
          });

          // update data nodes
          var node = chart.selectAll("g")
            .data(
              bubble_pack.nodes({'children':data})
                .filter(function(d) { return !d.children; }),
              function(d) { return d.channel; }
            );

          // check if we've just created the chart
          var firstCycle = (node.size() === 0);

          // node enter, one svg group per node, translated and scaled based on d.value
          var nodeEnter = node.enter()
            .append("g")
            .attr("clip-path", "url(#roundPath)")
            .attr("id", function(d) {
                return d.channel;
            })
            .each(function(d) {
              scope.bubble(d).g = d3.select(this);
            });

          // node entering in the very first cycle appear from the center
          if (firstCycle) {
            nodeEnter.attr("transform", function() {
              return "translate(450, 450) scale(1) ";
            });
          }
          // nodes enter from out of the canvas in a straight line to their destination
          else {
            nodeEnter.attr("transform", function(d) {
              var dx = 5*(d.x-500);
              var dy = 5*(d.y-500);

              return "translate("+dx+", "+dy+") scale(1) ";
            });
          }

          var nodeEnterA = nodeEnter.append("a")
            .attr("xlink:href", function(d) {
              return scope.bubble(d).profile.profile_url;
            })
            .attr("style", "text-decoration: none;")
            .on('mouseover', function(d) {
              var _this = d3.select(this);
              var bubble = scope.bubble(d);

              if (bubble.rank > 5) {
                _this.attr("data-hover", true);
                showNodeValue(_this).text(bubble.datum);
                showNodeChannel(_this).text(bubble.profile.display_name);
              }
            })
            .on('mouseout', function(d) {
              var _this = d3.select(this);
              var bubble = scope.bubble(d);

              if (bubble.rank > 5) {
                _this.attr("data-hover", false);
                hideNodeValue(_this, bubble.rank > 5);
                hideNodeChannel(_this, bubble.rank > 5);
              }
            });

          // plain color background
          nodeEnterA.append("rect")
            .attr("x", -50)
            .attr("y", -50)
            .attr("width", 100)
            .attr("height", 100)
            .attr("fill", "#555");

          // stream logo image
          nodeEnterA.append("image")
            .attr("clip-path", "url(#roundBorderPath)")
            .attr("x", -50)
            .attr("y", -50)
            .attr("width", 100)
            .attr("height", 100)
            .style("pointer-events", "none");

          // node update, without transition
          node
            .attr("class", function(d) {
              return "rank-"+scope.bubble(d).rank;
            });

          // node position update, with transition
          node
            .transition().duration(900)
            .attr("transform", function(d) {
              return "translate("+(d.x)+", "+(d.y)+") scale("+(d.r / 50)+") ";
            });

          // update the node's inner stuff
          node.each(function(d, i) {
            var _this = d3.select(this);
            var rect = _this.select("rect");
            var image = _this.select("image");
            var a = _this.select("a");
            var bubble = scope.bubble(d);

            // use a thumbnail after rank 15
            var src = (i <= 15 ? bubble.profile.logo :bubble.profile.thumbnail);

            if (image.attr("xlink:href") !== src) {
              image.attr("xlink:href", src);
            }

            // set the background's rect color
            if (i === 0) {
              rect.attr("fill", "#ffd741");
            }
            else if (i === 1) {
              rect.attr("fill", "#7e7c7d");
            }
            else if (i === 2) {
              rect.attr("fill", "#d96e38");
            }
            else {
              rect.attr("fill", "#555");
            }

            // remove text on lower nodes
            if (i >= 5) {
              hideNodeValue(a, true);
              hideNodeChannel(a, true);
            }
            else {
              // add the a text object to hold the value
              showNodeValue(a);

              // add the channel's name, this one never changes
              showNodeChannel(a).text(bubble.profile.display_name);
            }

            // update the value with the current d.value
            a.select('text.value').text(bubble.datum);
          });

          // node exit
          node.exit()
            .transition().duration(600)
            .attr("transform", function(d) {
              var dx = 5*(d.x-500);
              var dy = 5*(d.y-500);

              return "translate("+dx+", "+dy+") scale(1) ";
            })
            .remove();
        };

        scope.$watch('data', function() { updateChart(false); });
      }
    };
  })
;
