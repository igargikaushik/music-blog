<template>
  <div id="listening-guide-container">
    <b-select required placeholder="Choose video" icon="video" v-model="video_selected">
      <optgroup v-for="(group, index) in videos" :key="index" :label="group.type">
        <option v-for="video in group.entries" :key="video.id" :value="video.id">
          {{ video.name }}
        </option>
      </optgroup>
    </b-select>
    <div id="guide-player-container">
      <div id="guide-player" v-if="videos && videos.length > 0"></div>
    </div>
    <b-table
      v-if="videos && videos.length > 0"
      :data="table_data"
      :row-class="getRowClass"
      :mobile-cards="false"
      bordered>
      <b-table-column field="time" label="Time" v-slot="props">
        <a @click.prevent="seekTo(current_video.timestamps[props.index]);">
          {{ formatTime(current_video.timestamps[props.index]) }}
        </a>
      </b-table-column>
      <b-table-column field="description" label="Description" v-slot="props">
        {{ props.row.description }}
      </b-table-column>
    </b-table>
  </div>
</template>

<script>
export default {
  name: 'ListeningGuidePlayer',
  props: {
    videos: Array,
  },
  data() {
    return {
      player: null,
      current_time: 0,
      time_interval: null,
      video_selected: 0,
      /* videos: [
        {
          type: 'Sheet music', entries: [
            { id: 0, name: 'Kimiko Ishizaka', video_id: 'nPHIZw7HZq4', end_time: 156,
              timestamps: [0, 18, 35, 44, 48, 66, 70, 79, 83, 92, 101, 110, 136, 141] },
            { id: 1, name: 'Gerubach (Harpsichord performed by Kenneth Gilbert)', video_id: 'HlXDJhLeShg', start_time: 71, end_time: 202,
              timestamps: [71, 86, 100, 107, 111, 125, 128, 135, 139, 146, 153, 160, 181, 185] },
            { id: 2, name: 'Paul Barton', video_id: '_3qnL9ddHuw', start_time: 8, end_time: 129,
              timestamps: [8, 22, 36, 42, 45, 58, 62, 68, 71, 78, 84, 91, 111, 115] },
          ]
        },
        {
          type: 'Live', entries: [
            { id: 3, name: 'Lang Lang', video_id: 'gVah1cr3pU0', start_time: 10,
              timestamps: [10, 25, 40, 47, 51, 65, 69, 76, 80, 87, 95, 102, 124, 128] },
            { id: 4, name: 'András Schiff', video_id: 'kLSz55UXOLU', start_time: 9, end_time: 110,
              timestamps: [9, 20, 32, 36, 39, 50, 53, 59, 61, 67, 73, 78, 95, 98] },
          ],
        },
        {
          type: 'Visualizer', entries: [
            { id: 5, name: 'Rousseau', video_id: 'frxT2qB1POQ', end_time: 143,
              timestamps: [0, 19, 33, 41, 44, 59, 63, 71, 75, 82, 90, 98, 120, 124] },
            { id: 6, name: 'Smalin', video_id: '3RBgy9q8wFg',
              timestamps: [0, 23, 40, 48, 52, 70, 74, 83, 88, 97, 106, 115, 141, 146] },
          ],
        },
      ], */
      table_data: [
        { description: 'The piece immediately begins with a repeated pattern: Arpeggios each repeated twice. The first four bars progress very simply, starting and ending on the C major chord' },
        { description: 'Tension builds with slight dissonance. Notice how the bars alternate between wide intervals with high notes and narrow, consonant intervals' },
        { description: 'Several chords are played a C on top, acting as a pivot for a new key: G major' },
        { description: 'A tranquil moment on the tonic chord of the new key' },
        { description: 'Quickly interrupted by an unstable diminished chord with the same bottom note. Unsettled chords create tension, but the consonant high notes shine through' },
        { description: 'The dissonance lands on a new home chord of F, but dissonant base notes make it feel shaky' },
        { description: 'The F chord smoothly transitions to D minor, beginning a progression back into C major' },
        { description: 'A return to the same notes from the beginning, but an octave lower' },
        { description: 'The C chord turns dominant, leading back to a beautiful F major seventh chord' },
        { description: 'Similarly, the F chord becomes a diminished chord, leading us through several dissonant chords' },
        { description: 'A pedal G resonates in the bass while chords progress above' },
        { description: 'The top note of each chord slowly rises and descends in steps, staying on the suspenseful F note for two bars at a time' },
        { description: 'The pedal leads to an unexpectedly dominant C chord' },
        { description: 'A totally new theme breaks the pattern, creating a cadence over a C pedal, finally landing on a C chord' },
      ],
    };
  },
  beforeMount () {
    if (process.browser) {
      var tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      var firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        this.player = new window.YT.Player('guide-player', {
          events: {
            'onReady': this.updatePlayerVideo,
            'onStateChange': this.watchTime,
          },
          playerVars: { 
            'enablejsapi': 1,
            'origin': window.location.origin,
            'host': `${window.location.protocol}//www.youtube.com`,
          },
        });
      };
    }
  },
  computed: {
    current_video() {
      const placeholder = [{ type: '.', entries: [{ id: 0, name: '.', video_id: 'nPHIZw7HZq4', timestamps: [] }] }];
      const list = (this.videos && this.videos.length > 0) ? this.videos : placeholder;
      return list
        .flatMap(group => group.entries)
        .find(entry => entry.id == this.video_selected);
    },
  },
  watch: {
    current_video() {
      clearInterval(this.time_interval);
      this.time_interval = null;
      if (this.player) {
        this.updatePlayerVideo();
      }
    }
  },
  methods: {
    updatePlayerVideo() {
      if (this.player) {
        this.player.cueVideoById({
          videoId: this.current_video.video_id,
          startSeconds: this.current_video.start_time,
          endSeconds: this.current_video.end_time,
        });
      }
    },
    setTime() {
      this.current_time = Math.round(this.player.getCurrentTime());
    },
    watchTime(event) {
      if (!window || !window.YT) return;
      if (event.data == window.YT.PlayerState.PLAYING) {
        if (this.time_interval === null) {
          this.time_interval = setInterval(this.setTime, 1000);
        }
      } else if ([window.YT.PlayerState.PAUSED,
        window.YT.PlayerState.ENDED,
        window.YT.PlayerState.UNSTARTED].includes(event.data)) {
        clearInterval(this.time_interval);
        this.time_interval = null;
      }
    },
    formatTime(time) {
      if (time === null || time === undefined) return '';
      const hour = Math.floor(time / (60*60));
      const minute = Math.floor(time / 60);
      const second = Math.floor(time % 60).toString().padStart(2, '0');
      return ((hour > 0) ? `${hour}:` : '') + `${minute}:${second}`;
    },
    seekTo(time) {
      if (this.player) {
        this.current_time = time;
        this.player.seekTo(time);
        this.player.playVideo();
      }
    },
    getRowClass(row, index) {
      if (!this.current_time) return undefined;
      const this_row_time = this.current_video.timestamps[index];
      const next_row_time = this.current_video.timestamps[index+1] || Infinity;
      if (this_row_time <= this.current_time && this.current_time < next_row_time) {
        return 'current-row';
      } else {
        return undefined;
      }
    }
  }
};
</script>

<style lang="scss">
@import "~bulma/sass/utilities/initial-variables";

@media screen and (max-width: $tablet) {
  #listening-guide-container table {
    margin-top: 16px; 

    td:before {
      display: none;
    }

    td {
      text-align: left;
    }
  }
}

tr.current-row {
  background-color: #f7f7f7 !important;
}

#listening-guide-container {
  table {
    border: none; 
  }

 .select {
    margin-bottom: 4px;
  }
}

#guide-player {
  display: block;
  position: absolute;
  width: 100%;
  height: 100%;
  left: 0; top: 0;
}
</style>

<style scoped lang="scss">
#guide-player-container {
  position: relative;
  width: 100%;
  height: 0;
  padding-bottom: 51%;
}
</style>