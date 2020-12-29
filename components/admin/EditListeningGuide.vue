<template>
  <section class="section">
    <div class="columns is-gapless is-fullheight panes">
      <div class="column listening-guide-editor">
        <b-table
          :data="table_data"
          ref="table"
          detailed
          custom-detail-row
          :mobile-cards="false"
          detail-key="name">
          <b-table-column
            field="name"
            label="Name"
            v-slot="props"
            width="60%"
          >
            <a @click="toggle(props.row)">
              <strong>{{ props.row.name }}</strong>
            </a>
          </b-table-column>

          <b-table-column
            centered
            field="timestamp_status"
            label="Status"
            v-slot="props"
          >
            <span :class="['tag', (props.row.items.every(item => item.complete) ? 'is-success' : 'is-danger')]">
              {{ props.row.items.every(item => item.complete) ? 'All set' : 'Missing' }}
            </span>
          </b-table-column>

          <b-table-column
            field="actions"
            label=""
          >
          <template v-slot:header>
            <b-button type="is-success" icon-left="plus"
              @click="show_new_video_modal = true">
              New
            </b-button>
          </template>

          <template v-slot="props">
            <span class="buttons">
              <b-button size="is-small" icon-left="arrow-up"></b-button>
              <b-button size="is-small" icon-left="arrow-down"></b-button>
              <b-dropdown aria-role="list" position="is-bottom-left">
                <b-icon slot="trigger" icon="dots-vertical"></b-icon>
                <b-dropdown-item
                  aria-role="listitem">
                  Rename
                </b-dropdown-item>
              </b-dropdown>
            </span>
          </template>
          </b-table-column>

          <template slot="detail" slot-scope="props">
            <tr v-for="item in props.row.items" :key="`${props.row.name}-${item.index}`">
              <td></td>
              <td class="has-text-left">{{ item.name }}</td>
              <td>
                <span :class="['tag', item.complete ? 'is-success' : 'is-danger']">
                  {{ item.complete ? 'All set' : 'Missing' }}
                </span>
              </td>
              <td>
                <span class="buttons">
                  <b-button size="is-small" icon-left="arrow-up"></b-button>
                  <b-button size="is-small" icon-left="arrow-down"></b-button>
                  <b-dropdown aria-role="list" position="is-bottom-left">
                    <b-icon slot="trigger" icon="dots-vertical"></b-icon>
                    <b-dropdown-item
                      aria-role="listitem"
                      @click="editVideo(item.index)">
                      Edit
                    </b-dropdown-item>
                    <ConfirmButton
                      verb="delete"
                      kind="video"
                      :title="item.name"
                      text="Delete"
                      @confirm="deleteVideo(item.index)"
                    />
                  </b-dropdown>
                </span>
              </td>
            </tr>
          </template>
        </b-table>
      </div>
      <div class="column has-text-left listening-guide-preview">
        <ListeningGuidePlayer />
      </div>
    </div>

    <b-modal v-model="show_new_video_modal" :width="640" :on-cancel="closeModal">
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">
            {{ (editing_video !== null)
              ? `Editing "${this.videos[editing_video].name}"`
              : "Add new video" }}
          </p>
          <button
            type="button"
            class="delete"
            @click="show_new_video_modal = false"/>
        </header>
        <form @submit.prevent="addVideo" @keydown.enter.prevent="">
          <section class="modal-card-body">
            <b-field label="Name" label-position="inside">
              <b-input
                v-model="new_name"
                placeholder="Name"
                required>
              </b-input>
            </b-field>

            <b-field label="Youtube video ID" label-position="inside">
              <b-input
                v-model="new_video_id"
                placeholder="e.g. nPHIZw7HZq4"
                required>
              </b-input>
            </b-field>

            <b-field label="Video type" label-position="inside">
              <b-autocomplete
                v-model="new_type"
                open-on-focus
                :data="filteredTypes"
                placeholder="e.g. Sheet music"
                clearable
                required>
                <template slot="empty">No results found</template>
              </b-autocomplete>
            </b-field>

            <b-field horizontal>
            <b-field label="Start time" label-position="inside">
              <b-input
                v-model="new_start_time"
                placeholder="e.g. 1:45:01, 0:05"
                validation-message="Invalid time"
                pattern="(?:(\d{1,2}):)?(\d{1,2}):(\d{2})">
              </b-input>
            </b-field>
            <b-field label="End time" label-position="inside">
              <b-input
                v-model="new_end_time"
                placeholder="e.g. 1:45:01, 0:05"
                validation-message="Invalid time"
                pattern="(?:(\d{1,2}):)?(\d{1,2}):(\d{2})">
              </b-input>
            </b-field>
            </b-field>
          </section>
          <footer class="modal-card-foot">
            <button class="button is-success" type="submit">
              {{ (editing_video !== null)
                ? "Update"
                : "Create" }}
            </button>
          </footer>
        </form>
      </div>
    </b-modal>
  </section>
</template>

<script>
export default {
  name: 'EditListeningGuide',
  data() {
    return {
      show_new_video_modal: false,
      editing_video: null,
      new_name: '',
      new_video_id: '',
      new_type: '',
      new_start_time: '',
      new_end_time: '',
      videos: [
        { name: 'Kimiko Ishizaka', video_id: 'nPHIZw7HZq4',
          type: 'Sheet music', end_time: 156,
          timestamps: [0, 18, 35, 44, 48, 66, 70, 79, 83, 92, 101, 110, 136, 141] },
        { name: 'Gerubach (Harpsichord | Kenneth Gilbert)', video_id: 'HlXDJhLeShg',
          type: 'Sheet music', start_time: 71, end_time: 202,
          timestamps: [71, 86, 100, 107, 111, 125, 128, 135, 139, 146, 153, 160, 181, 185] },
        { name: 'Lang Lang', video_id: 'gVah1cr3pU0',
          type: 'Live', start_time: 10,
          timestamps: [null, 25, null, null, null, null, null, null, null, null, null, null, null, null] },
      ],
      descriptions: [
        'The piece immediately begins with a repeated pattern: Arpeggios each repeated twice. The first four bars progress very simply, starting and ending on the C major chord',
        'Tension builds with slight dissonance. Notice how the bars alternate between wide intervals with high notes and narrow, consonant intervals',
        'Several chords are played a C on top, acting as a pivot for a new key: G major',
        'A tranquil moment on the tonic chord of the new key',
        'Quickly interrupted by an unstable diminished chord with the same bottom note. Unsettled chords create tension, but the consonant high notes shine through',
        'The dissonance lands on a new home chord of F, but dissonant base notes make it feel shaky',
        'The F chord smoothly transitions to D minor, beginning a progression back into C major',
        'A return to the same notes from the beginning, but an octave lower',
        'The C chord turns dominant, leading back to a beautiful F major seventh chord',
        'Similarly, the F chord becomes a diminished chord, leading us through several dissonant chords',
        'A pedal G resonates in the bass while chords progress above',
        'The top note of each chord slowly rises and descends in steps, staying on the suspenseful F note for two bars at a time',
        'The pedal leads to an unexpectedly dominant C chord',
        'A totally new theme breaks the pattern, creating a cadence over a C pedal, finally landing on a C chord',
      ],
      types: [],
      table_data: [],
    };
  },
  methods: {
    closeModal() {
      this.editing_video = null;
      this.new_name = '';
      this.new_video_id = '';
      this.new_type = '';
      this.new_start_time = '';
      this.new_end_time = '';
      this.show_new_video_modal = false;
    },
    addVideo() {
      const getSeconds = (time_str) => time_str.split(':')
        .reduce((acc,time) => (60 * acc) + +time);
      const trySeconds = (time_str) => time_str
        ? getSeconds(time_str) : undefined;
      const timestamps = this.videos[this.editing_video]?.timestamps
        || new Array(this.descriptions.length).fill(null);
      const new_video = {
        name: this.new_name,
        video_id: this.new_video_id,
        type: this.new_type,
        start_time: trySeconds(this.new_start_time),
        end_time: trySeconds(this.new_end_time),
        timestamps,
      };
      if (this.editing_video !== null) {
        Object.assign(this.videos[this.editing_video], new_video);
      } else {
        this.videos.push(new_video);
      }
      this.closeModal();
    },
    toggle(row) {
      this.$refs.table.toggleDetails(row);
    },
    editVideo(index) {
      const formatTime = (secs) => {
        const sec_num = parseInt(secs, 10);
        const hours = Math.floor(sec_num / 3600);
        const minutes = Math.floor(sec_num / 60) % 60;
        const seconds = sec_num % 60;

        return [hours, minutes, seconds]
          .map(v => v < 10 ? '0' + v : v)
          .filter((v,i) => v !== '00' || i > 0)
          .join(':');
      };
      const tryFormatTime = (secs) =>
        secs ? formatTime(secs) : '';

      this.editing_video = index;
      const existing = this.videos[this.editing_video];
      this.new_name = existing.name || '';
      this.new_video_id = existing.video_id || '';
      this.new_type = existing.type || '';
      this.new_start_time = tryFormatTime(existing.start_time),
      this.new_end_time = tryFormatTime(existing.end_time),
      this.show_new_video_modal = true;
    },
    deleteVideo(index) {
      this.videos.splice(index, 1);
    },
  },
  watch: {
    videos: {
      handler(val) {
        const videos_by_type = {};
        for (const [index, video] of val.entries()) {
          const { type, name, timestamps } = video;
          const complete =
            (timestamps.length == this.descriptions.length)
            && !timestamps.includes(null);
          videos_by_type[type] = (videos_by_type[type] || []).concat([{ index, name, complete }]);
        }

        this.types = Object.keys(videos_by_type);
        this.table_data = this.types.map(name => {
          return { name, items: videos_by_type[name] };
        });
      },
      immediate: true,
      deep: true,
    },
  },
  computed: {
    filteredTypes() {
      return this.types.filter((type) => {
        return type
          .toString()
          .toLowerCase()
          .indexOf(this.new_type.toLowerCase()) >= 0;
      });
    }
  }

};
</script>

<style lang="scss">
.listening-guide-editor  {
  th {
    vertical-align: bottom;

    button {
      padding-left: 0;
    }
  }

  td > a {
    color: inherit;
    text-decoration: inherit;
    display: inherit;
  }

  .icon.is-small {
    font-size: 1.3em;
  }
}

#edit-article {
  .modal-card-body {
    overflow: visible;

    .is-horizontal .field-label {
      display: none;
    }
  }
}
</style>

<style scoped lang="scss">
.section {
  padding: 0;
}

.listening-guide-preview {
  margin-top: 16px;
}

.panes {
  min-height: calc(100vh - 68px * 2);
  padding: 0 8px;
}

.listening-guide-editor {
  min-height: calc(100vh - 68px * 2);
  display: flex;
  flex-flow: column;
  border-right: 2px solid #f5f5f5;
}

.control,
.content {
  height: 100%;
}

.dropdown-item {
  text-align: left;
}
</style>