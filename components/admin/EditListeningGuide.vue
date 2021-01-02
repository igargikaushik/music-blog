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
          :row-class="(row) => (selected_index !== null && videos[selected_index].type === row.name) && 'selected-video'"
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
                <b-button size="is-small" icon-left="arrow-up"
                  :disabled="props.index === 0"
                  @click="moveType(props.row.name, -1)"></b-button>
                <b-button size="is-small" icon-left="arrow-down"
                  :disabled="props.index >= table_data.length - 1"
                  @click="moveType(props.row.name, 1)"></b-button>
                <b-dropdown aria-role="list" position="is-bottom-left">
                  <b-icon slot="trigger" icon="dots-vertical"></b-icon>
                  <b-dropdown-item
                    aria-role="listitem"
                    @click="renameType(props.row.name)">
                    Rename
                  </b-dropdown-item>
                </b-dropdown>
              </span>
            </template>
          </b-table-column>

          <template slot="detail" slot-scope="props">
            <tr v-for="(item, index) in props.row.items" :key="`${props.row.name}-${item.index}`"
              :class="{ 'selected-video': item.index === selected_index }">
              <td></td>
              <td class="has-text-left">
                <a @click="selected_index = item.index">
                  {{ item.name }}
                </a>
                </td>
              <td>
                <span :class="['tag', item.complete ? 'is-success' : 'is-danger']">
                  {{ item.complete ? 'All set' : 'Missing' }}
                </span>
              </td>
              <td>
                <span class="buttons">
                  <b-button size="is-small" icon-left="arrow-up"
                    :disabled="index === 0"
                    @click="moveVideo(props.row.name, index, -1)"></b-button>
                  <b-button size="is-small" icon-left="arrow-down"
                    :disabled="index >= props.row.items.length - 1"
                    @click="moveVideo(props.row.name, index, 1)"></b-button>
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

        <h2 v-if="selected_index !== null" class="subtitle has-text-center my-2">Editing "{{ videos[selected_index].name }}"</h2>
        <b-table
          :data="descriptions"
          :mobile-cards="true"
          class="descriptions-editor"
          bordered>
          <b-table-column field="section" label="Head" v-slot="props">
            <div class="field">
              <b-checkbox v-model="props.row.is_section">
              </b-checkbox>
            </div>
          </b-table-column>
          <b-table-column field="time" label="Time" v-slot="props">
            <b-field>
              <b-input
                v-if="selected_index !== null"
                :value="formattedTimestamps[props.index]"
                required
                lazy
                :icon-right="null"
                @input="(value) => updateTimestamp(value, props.index)"
                validation-message="Invalid time"
                pattern="(?:(\d{1,2}):)?(\d{1,2}):(\d{2})">
              </b-input>
            </b-field>
          </b-table-column>
          <b-table-column field="description" label="Description" width="70%" v-slot="props">
            <textarea class="textarea" rows="1" v-model="props.row.description" />
          </b-table-column>
          <b-table-column
            field="actions"
            label=""
          >
            <template v-slot="props">
              <b-dropdown aria-role="list" position="is-bottom-left">
                <b-icon slot="trigger" icon="dots-vertical"></b-icon>
                <b-dropdown-item
                  aria-role="listitem"
                  @click="addDescription(props.index, -1)">
                  Add row above
                </b-dropdown-item>
                <b-dropdown-item
                  aria-role="listitem"
                  @click="addDescription(props.index, 1)">
                  Add row below
                </b-dropdown-item>
                <ConfirmButton
                  verb="delete"
                  kind="description"
                  :title="(props.row.description.length > 40) ? props.row.description.substr(0, 20) + '&hellip;' : props.row.description"
                  text="Delete"
                  @confirm="deleteDescription(props.index)"
                />
              </b-dropdown>
            </template>
          </b-table-column>
          <template slot="footer">
            <a class="has-text-centered" @click="addDescription(descriptions.length - 1, 1)">
              + Add description
            </a>
        </template>
        </b-table>
      </div>
      <div class="column has-text-left listening-guide-preview">
        <ListeningGuidePlayer v-if="videos.length > 0" :videos="player_videos" :descriptions="descriptions" />
        <div v-else>
          <h1 class="title has-text-centered">Add a video to preview player</h1>
        </div>
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
  props: {
    videos: Array,
    descriptions: Array,
  },
  data() {
    return {
      show_new_video_modal: false,
      editing_video: null,
      new_name: '',
      new_video_id: '',
      new_type: '',
      new_start_time: '',
      new_end_time: '',
      selected_index: null,
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
      const timestamps = this.videos[this.editing_video]?.timestamps
        || new Array(this.descriptions.length).fill(null);
      const new_video = {
        name: this.new_name,
        video_id: this.new_video_id,
        type: this.new_type,
        start_time: this.getSeconds(this.new_start_time),
        end_time: this.getSeconds(this.new_end_time),
        timestamps,
      };
      if (this.editing_video !== null) {
        Object.assign(this.videos[this.editing_video], new_video);
      } else {
        this.videos.push(new_video);
        this.selected_index = this.videos.length - 1;
      }
      this.closeModal();
    },
    toggle(row) {
      this.$refs.table.toggleDetails(row);
    },
    editVideo(index) {
      this.editing_video = index;
      const existing = this.videos[this.editing_video];
      this.new_name = existing.name || '';
      this.new_video_id = existing.video_id || '';
      this.new_type = existing.type || '';
      this.new_start_time = this.formatTime(existing.start_time),
      this.new_end_time = this.formatTime(existing.end_time),
      this.show_new_video_modal = true;
    },
    deleteVideo(index) {
      this.videos.splice(index, 1);
    },
    async renameType(name) {
      const index = this.table_data.findIndex((type) => type.name === name);
      if (index === -1) return;
      const { result } = await this.$buefy.dialog.prompt({
        message: `To what would you like to rename the type "${name}"?`,
        inputAttrs: {
          placeholder: 'e.g. Sheet music',
        },
        type: 'is-success',
        trapFocus: true,
      });

      if (result) {
        this.table_data[index].items.map((item) => {
          this.videos[item.index].type = result;
        });
        this.$buefy.toast.open({ message: 'Type renamed', type: 'is-success', duration: 3000, });
      } else {
        this.$buefy.toast.open({ message: 'Canceled rename', type: 'is-danger', duration: 3000 });
      }
    },
    moveVideo(type, type_index, direction) {
      const index = this.table_data.findIndex(group => group.name === type);
      if (index === -1) return;

      // Reorder the pointer indices of the tabular data,
      // then update the actual video list to reflect the change
      let table_indices = this.table_data.map(group => group.items.map(item => item.index));
      const move_index = table_indices[index].splice(type_index, 1)[0];
      table_indices[index].splice(type_index + direction, 0, move_index);
      const new_indices = table_indices.flat();
      if (this.selected_index !== null) this.selected_index = new_indices.indexOf(this.selected_index);
      this.videos = new_indices.map(video_index => this.videos[video_index]);
    },
    moveType(type, direction) {
      const index = this.table_data.findIndex(group => group.name === type);
      if (index === -1) return;

      let table_indices = this.table_data.map(group => group.items.map(item => item.index));
      const type_indices = table_indices.splice(index, 1)[0];
      table_indices.splice(index + direction, 0, type_indices);
      const new_indices = table_indices.flat();
      if (this.selected_index !== null) this.selected_index = new_indices.indexOf(this.selected_index);
      this.videos = new_indices.map(video_index => this.videos[video_index]);
    },
    updateTimestamp(value, index) {
      if(!/(?:(\d{1,2}):)?(\d{1,2}):(\d{2})/.test(value)) return;
      let copy = this.videos[this.selected_index];
      copy.timestamps[index] = this.getSeconds(value);
      this.$set(this.videos, this.selected_index, copy);
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
    getSeconds(time_str) {
      if (!time_str) return null;
      return time_str.split(':').reduce((acc,time) => (60 * acc) + +time);
    },
    addDescription(index, direction) {
      const splice_index = index + ((direction == 1) ? 1 : 0);
      this.descriptions.splice(splice_index, 0, { is_section: false, description: '' });
      this.videos.forEach((_video, index) => {
        this.videos[index].timestamps.splice(splice_index, 0, null);
      });
    },
    deleteDescription(index) {
      this.descriptions.splice(index, 1);
      this.videos.forEach((_video, video_index) => {
        this.videos[video_index].timestamps.splice(index, 1);
      });
    }
  },
  watch: {
    videos: {
      handler(val) {
        const videos_by_type = {};
        const player_videos_by_type = {};
        for (const [index, video] of val.entries()) {
          const { type, name, timestamps, video_id, start_time, end_time } = video;
          const complete =
            (timestamps.length == this.descriptions.length)
            && !timestamps.includes(null);
          videos_by_type[type] = (videos_by_type[type] || []).concat([{ index, name, complete }]);
          player_videos_by_type[type] = (player_videos_by_type[type] || [])
            .concat([{ id: index, name, video_id, start_time, end_time, timestamps }]);
        }

        this.types = Object.keys(videos_by_type);
        this.table_data = this.types.map(name => {
          return { name, items: videos_by_type[name] };
        });
        this.player_videos = this.types.map(name => {
          return { type: name, entries: player_videos_by_type[name] };
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
    },
    formattedTimestamps() {
      return this.videos[this.selected_index].timestamps
        .map(this.formatTime);
    },
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

  tr.selected-video {
    background: #f0f0f0;
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

.descriptions-editor {
  .tooltip-trigger {
    cursor: pointer !important;
  }

  .control.has-icons-right {
    input {
      padding-right: inherit;
    }

    .icon.has-text-danger {
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