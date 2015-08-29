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
      replace: true,
      scope: {data: '=chartData', field: '@chartField'},
      link: function (scope, element) {
        var diameter = 950;

        var bubble = d3.layout.pack()
          .sort(null)
          .size([diameter, diameter])
          .padding(0)
          .value(function(d) {
            return d[scope.field];
          });

        // never updated yet
        var last_update = new Date(1970);

        // store loaded profiles to save on back and forth with the twitchProfile service
        var profileCache = {};

        // add a [top15 - top100] button
        var showAll = false;

        d3.select(element[0])
          .append("button")
          .attr("class", "btn btn-danger pull-right")
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

          // prepare data for display
          data = data.map(function(d, i) {

            var profile;

            // try to cache new profiles
            if (!(d.channel in profileCache)) {

              profile = twitchProfiles.load(d.channel);

              // the loader may return best-effort values, don't cache those
              if ('cachedDate' in profile) {
                profileCache[d.channel] = profile;
              }
            }
            else {
              profile = profileCache[d.channel];
            }

            // enhance data we got from the API with profile details
            d.rank = (i+1);
            d.profile_url = "#/channel/"+d.channel.replace("#", "");
            d.display_name = profile.display_name;
            d.logo = profile.logo;
            d.thumbnail = profile.thumbnail;

            return d;
          });

          // update data nodes
          var node = chart.selectAll("g")
            .data(
              bubble.nodes({'children':data})
                .filter(function(d) { return !d.children; }),
              function(d) { return d.channel; }
            );

          // node enter, one svg group per node, translated and scaled based on d.value
          var nodeEnter = node.enter()
            .append("g")
            .attr("clip-path", "url(#roundPath)");

          var nodeEnterA = nodeEnter.append("a")
            .attr("xlink:href", function(d) {
              return d.profile_url;
            })
            .on('mouseout', function() {
              d3.select(this).selectAll("text").remove();
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
            .attr("height", 100);

          // node update, without transition
          node
            .attr("class", function(d) {
              return "rank-"+d.rank;
            });

          // node position update, with transition
          node
            .transition().duration(900)
            .attr("transform", function(d) {
              return "translate("+(d.x)+", "+(d.y)+") scale("+(d.r / 50)+") ";
            });

          // update the streamer's logo
          node.each(function(d, i) {
            var image = d3.select(this).select("image");

            // use the thumbnail after rank 10
            var src = (i <= 10 ? d.logo : d.thumbnail);

            if (image.attr("xlink:href") !== src) {
              image.attr("xlink:href", src);
            }
          });

          // set the mouseover every cycle because d3 caches its result
          node.select("a").on('mouseover', function(d) {

            // show the current value
            d3.select(this).append("text")
              .attr("class", "value")
              .attr("fill", "white")
              .attr("text-anchor", "middle")
              .attr("dy", "1em")
              .attr("font-size", "2em")
              .text(function() {
                  return d[scope.field];
              });

            // this one never changes but we only have a single mouseover callback
            d3.select(this).append("text")
              .attr("class", "channel")
              .attr("fill", "white")
              .attr("text-anchor", "middle")
              .attr("dy", "4.2em")
              .attr("font-size", "0.6em")
              .text(function() {
                return d.display_name;
              });
          })
          .select("text.value")
          .text(function(d) {
            return d.value;
          });

          // node exit
          node.exit().remove();
        };

        scope.$watch('data', function() { updateChart(false); });
      }
    };
  })
;
