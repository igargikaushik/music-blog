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
      :data="descriptions"
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
    descriptions: Array,
  },
  data() {
    return {
      player: null,
      current_time: 0,
      time_interval: null,
      video_selected: 0,
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
    current_video(new_video, old_video) {
      if (new_video.video_id === old_video.video_id) return;
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