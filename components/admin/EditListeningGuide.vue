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
            <strong>{{ props.row.name }}</strong>
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
            v-slot="props"
          >
            <span class="buttons">
              <b-button size="is-small" icon-left="arrow-up"></b-button>
              <b-button size="is-small" icon-left="arrow-down"></b-button>
              <b-dropdown aria-role="list" position="is-bottom-left">
                <b-icon slot="trigger" icon="dots-vertical"></b-icon>
                <b-dropdown-item
                  aria-role="listitem">
                  Move to group...
                </b-dropdown-item>
                <ConfirmButton
                  verb="delete"
                  kind="video"
                  :title="'TITLE'"
                  text="Delete"
                  @confirm="delete_video(563215321)"
                />
              </b-dropdown>
            </span>
          </b-table-column>

          <template slot="detail" slot-scope="props">
            <tr v-for="item in props.row.items" :key="item.name">
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
                      @click="rename(item.id, item.name)">
                      Move to group...
                    </b-dropdown-item>
                    <ConfirmButton
                      verb="delete"
                      kind="video"
                      :title="item.name"
                      text="Delete"
                      @confirm="delete_video(item.id)"
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
  </section>
</template>

<script>
export default {
  name: 'EditListeningGuide',
  data() {
    return {
      table_data: [
        {
          name: 'Sheet music',
          items: [
            { id: 0, name: 'Kimiko Ishizaka', complete: true },
            { id: 1, name: 'Gerubach (Harpsichord performed by Kenneth Gilbert)', complete: false },
            { id: 2, name: 'Paul Barton', complete: false },
          ],
        },
        {
          name: 'Live',
          items: [
            { id: 3, name: 'Lang Lang', complete: true },
            { id: 4, name: 'András Schiff', complete: false },
          ],
        },
        {
          name: 'Visualizer',
          items: [
            { id: 5, name: 'Rousseau', complete: true },
            { id: 6, name: 'Smalin', complete: true },
          ],
        },
      ]
    };
  },
};
</script>

<style lang="scss">
.listening-guide-editor  {
  td > strong {
    display: table-cell;
  }

  .icon.is-small {
    font-size: 1.3em;
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