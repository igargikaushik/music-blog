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

    <div v-if="videos && videos.length > 0 && descriptions && descriptions.length > 0">
      <b-table
        v-if="descriptions.some(x => x.is_section)"
        :data="grouped_descriptions"
        ref="table"
        detailed
        custom-detail-row
        :row-class="getGroupClass"
        :mobile-cards="false"
        bordered
        detail-key="index">
        <b-table-column field="time" label="Time" v-slot="props">
          <a @click.prevent="seekTo(current_video.timestamps[props.row.index]);">
            {{ formatTime(current_video.timestamps[props.row.index]) }}
          </a>
        </b-table-column>
        <b-table-column field="description" label="Description" v-slot="props">
          {{ props.row.description }}
        </b-table-column>

        <template slot="detail" slot-scope="props">
          <tr v-for="entry in props.row.entries" :key="`${props.row.index}-${entry.index}`"
            :class="getRowClass(props.row, entry.index)">
            <td></td>
            <td>
              <a @click.prevent="seekTo(current_video.timestamps[entry.index]);">
                {{ formatTime(current_video.timestamps[entry.index]) }}
              </a>
            </td>
            <td>
              {{ entry.description }}
            </td>
          </tr>
        </template>
      </b-table>

      <b-table
        v-else
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
  mounted() {
    if (process.browser) {
      var tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      var firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
       
      let player_params = {
        events: {
          'onReady': this.updatePlayerVideo,
          'onStateChange': this.watchTime,
        },
        playerVars: { 
          'enablejsapi': 1,
          'origin': window.location.origin,
          'host': `${window.location.protocol}//www.youtube.com`,
        },
      };
      window.onYouTubeIframeAPIReady = () => {
        this.player = new window.YT.Player('guide-player', player_params);
      };

      // Fixes initialization after the API has already been loaded
      // For example, after loading a player, then leaving and returning to a page
      if (window.YT && !this.player) {
        this.player = new window.YT.Player('guide-player', player_params);
      }
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
    grouped_descriptions() {
      const section_indices = [...this.descriptions.keys()].filter(i => this.descriptions[i].is_section);
      if (section_indices.length === 0) return this.descriptions;

      const desc_indexed = this.descriptions.map((description, i) => {
        return { description: description.description, index: i };
      });

      return section_indices.map((_val, i) => {
        const section_start = section_indices[i];
        const section_end = section_indices[i+1] || desc_indexed.length;
        return {
          ...desc_indexed[section_start],
          entries: desc_indexed.slice(section_indices[i] + 1, section_end)
        };
      });
    },
    sections() {
      return [...this.descriptions.entries()].filter(desc => desc[1].is_section);
    },
  },
  watch: {
    current_video(new_video, old_video) {
      if (new_video.video_id === old_video.video_id
        && new_video.start_time === old_video.start_time
        && new_video.end_time === old_video.end_time) return;
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
      this.openActiveSection();
    },
    watchTime(event) {
      if (!window || !window.YT) return;
      if (event.data == window.YT.PlayerState.PLAYING) {
        if (this.time_interval === null) {
          this.setTime();
          this.time_interval = setInterval(this.setTime, 1000);
        }
      } else if ([window.YT.PlayerState.PAUSED,
        window.YT.PlayerState.ENDED,
        window.YT.PlayerState.UNSTARTED].includes(event.data)) {
        clearInterval(this.time_interval);
        this.time_interval = null;
      }
    },
    formatTime(secs) {
      if (secs === undefined || secs === null) return '';

      const sec_num = parseInt(secs, 10);
      const hours = Math.floor(sec_num / 3600);
      const minutes = Math.floor(sec_num / 60) % 60;
      const seconds = sec_num % 60;

      return [hours, minutes, seconds]
        .map(v => v < 10 ? '0' + v : v)
        .filter((v,i) => v !== '00' || i > 0)
        .join(':');
    },
    seekTo(time) {
      if (this.player) {
        this.current_time = time;
        this.player.seekTo(time);
        this.player.playVideo();
        this.openActiveSection();
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
    },
    getGroupClass(row, index) {
      if (!this.current_time) return undefined;
      const this_group_time = this.current_video.timestamps[this.grouped_descriptions[index].index];
      const next_group_time = this.current_video.timestamps[this.grouped_descriptions[index+1]?.index]
        || Infinity;
      if (this_group_time <= this.current_time && this.current_time < next_group_time) {
        return 'current-row';
      } else {
        return undefined;
      }
    },
    openActiveSection() {
      if (!this.current_time) return undefined;
      const section = this.sections.find(section => {
        return (Math.abs(this.current_video.timestamps[section[0]] - this.current_time)) <= 1;
      });
      if (section !== undefined) this.$refs.table.openDetailRow({ index: section[0] });
    },
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