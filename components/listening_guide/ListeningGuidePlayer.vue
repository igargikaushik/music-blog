<template>
  <div id="listening-guide-container">
    <div id="guide-player-container">
      <iframe
        id="guide-player"
        src="https://www.youtube.com/embed/nPHIZw7HZq4?enablejsapi=1&start=0&end=156"
        frameborder="0"
      ></iframe>
    </div>
    <b-table
      :data="table_data"
      :row-class="getRowClass"
      bordered>
      <b-table-column field="time" label="Time" v-slot="props">
        <a @click.prevent="seekTo(props.row.time);">{{ formatTime(props.row.time) }}</a>
      </b-table-column>
      <b-table-column field="description" label="Description" v-slot="props">
        {{ props.row.description }}
      </b-table-column>
    </b-table>
  </div>
</template>

<script>

export default {
  data() {
    return {
      player: null,
      current_time: 0,
      time_interval: null,
      table_data: [
        { time: 0, description: 'The piece immediately begins with a repeated pattern: Arpeggios each repeated twice. The first four bars progress very simply, starting and ending on the C major chord' },
        { time: 18, description: 'Tension builds with slight dissonance. Notice how the bars alternate between wide intervals with high notes and narrow, consonant intervals' },
        { time: 35, description: 'Several chords are played a C on top, acting as a pivot for a new key: G major' },
        { time: 44, description: 'A tranquil moment on the tonic chord of the new key' },
        { time: 48, description: 'Quickly interrupted by an unstable diminished chord with the same bottom note. Unsettled chords create tension, but the consonant high notes shine through' },
        { time: 66, description: 'The dissonance lands on a new home chord of F, but dissonant base notes make it feel shaky' },
        { time: 70, description: 'The F chord smoothly transitions to D minor, beginning a progression back into C major' },
        { time: 79, description: 'A return to the same notes from the beginning, but an octave lower' },
        { time: 83, description: 'The C chord turns dominant, leading back to a beautiful F major seventh chord' },
        { time: 92, description: 'Similarly, the F chord becomes a diminished chord, leading us through several dissonant chords' },
        { time: 101, description: 'A pedal G resonates in the bass while chords progress above' },
        { time: 110, description: 'The top note of each chord slowly rises and descends in steps, staying on the suspenseful F note for two bars at a time' },
        { time: 136, description: 'The pedal leads to an unexpectedly dominant C chord' },
        { time: 141, description: 'A totally new theme breaks the pattern, creating a cadence over a C pedal, finally landing on a C chord' },
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
            'onStateChange': this.watchTime,
          }
        });
      };
    }
  },
  methods: {
    setTime() {
      this.current_time = Math.round(this.player.getCurrentTime());
    },
    watchTime(event) {
      if (!window || !window.YT) return;
      if (event.data == window.YT.PlayerState.PLAYING) {
        this.time_interval = setInterval(this.setTime, 1000);
      } else if (event.data == window.YT.PlayerState.PAUSED
        || event.data == window.YT.PlayerState.ENDED) {
        clearInterval(this.time_interval);
      }
    },
    formatTime(time) {
      const hour = Math.floor(time / (60*60));
      const minute = Math.floor(time / 60);
      const second = Math.floor(time % 60).toString().padStart(2, '0');
      return ((hour > 0) ? `${hour}:` : '') + `${minute}:${second}`;
    },
    seekTo(time) {
      if (this.player) {
        this.player.seekTo(time);
        this.player.playVideo();
      }
    },
    getRowClass(row, index) {
      const next_row_time = this.table_data[index+1]?.time || Infinity;
      if (row.time <= this.current_time && this.current_time < next_row_time) {
        return 'current-row';
      } else {
        return undefined;
      }
    }
  }
};
</script>

<style scoped lang="scss">
#guide-player-container {
  position: relative;
  width: 100%;
  height: 0;
  padding-bottom: 51%;
}

#guide-player {
  display: block;
  position: absolute;
  width: 100%;
  height: 100%;
  left: 0; top: 0;
}
</style>

<style lang="scss">
tr.current-row {
  background-color: #f7f7f7 !important;
}

#listening-guide-container table {
  border: none; 
}
</style>