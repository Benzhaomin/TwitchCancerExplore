'use strict';

/**
 * @ngdoc function
 * @name twitchCancer.directive:BubblesChart
 * @description
 * # BubblesChart
 * Directive used to render data as a bubbles chart
 */
angular.module('directives.bubblechart.bubble', ['twitchProfile'])
  .factory("Bubble", function(twitchProfiles) {

    function Bubble(channel) {

      // id of this bubble
      this.channel = channel;

      // transient data, changes every cycle
      this.datum = 0;

      // transient data, changes every cycle
      this.rank = 0;

      // svg object created for this bubble
      this.g = null;

      // Twitch profile of the channel, loaded once
      this.profile = twitchProfiles.lazy_load(channel);
      this.profile.profile_url = window.location + "channel/"+this.channel;

      Bubble.prototype._on_profile_loaded = function(profile) {

        // store the loaded profile
        this.profile = profile;

        // update our g if present
        if (!this.g) {
          return;
        }

        var image = this.g.select("image");

        // use a thumbnail after rank 15
        var src = (this.rank <= 15 ? this.profile.logo : this.profile.thumbnail);

        if (image.attr("xlink:href") !== src) {
          image.attr("xlink:href", src);
        }
      };

      // request a profile load
      var me = this;

      twitchProfiles.load(channel).then(function(profile) {
        me._on_profile_loaded(profile);
      });
    }

    return Bubble;
  })
;
