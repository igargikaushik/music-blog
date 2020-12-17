<template>
  <div id="dashboard-content">
    <section>
      <table class="table is-fullwidth has-text-left">
        <thead>
          <tr>
            <th>Title</th>
            <th>Category</th>
            <th>Trashed</th>
            <th>Created</th>
            <th>Updated</th>
            <th>Author</th>
            <th>Type</th>
            <th>Article</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in trash" :key="item.id">
            <td>{{ item.title }}</td>
            <td>{{ item.category }}</td>
            <td>{{ date(item.trash_time) }}</td>
            <td>{{ date(item.creation_time) }}</td>
            <td>{{ item.update_time ? date(item.update_time) : 'N/A' }}</td>
            <td>{{ item.author }}</td>
            <td>{{ item.doc_type.charAt(0).toUpperCase() + item.doc_type.substr(1).toLowerCase() }}</td>
            <td>
              <NuxtLink v-if="item.draft_article_slug" :to="'/article/' + item.draft_article_slug">Article</NuxtLink>
              <span v-else>N/A</span>
            </td>
            <td>
              <span class="buttons">
                <b-dropdown aria-role="list" position="is-bottom-left">
                  <b-icon slot="trigger" icon="dots-vertical"></b-icon>
                  <b-dropdown-item
                    aria-role="listitem"
                    @click="rename(item.id, item.title)">
                    Rename
                  </b-dropdown-item>
                  <ConfirmButton
                    verb="restore"
                    :kind="item.doc_type"
                    :title="item.title"
                    text="Restore"
                    @confirm="restore(item.id, item.doc_type)"
                  />
                  <ConfirmButton
                    verb="permanently delete"
                    :kind="item.doc_type"
                    :title="item.title"
                    text="Delete forever"
                    @confirm="delete_item(item.id)"
                  />
                </b-dropdown>
              </span>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="$fetchState.pending" style="position: relative; height: 60px; margin-bottom: 1.5rem;">
        <b-loading :is-full-page="false" v-model="$fetchState.pending"></b-loading>
      </div>
      <b-pagination
        v-else
        simple
        per-page="20"
        order="is-centered"
        :total="total"
        v-model="page"
        aria-next-label="Next page"
        aria-previous-label="Previous page"
        aria-page-label="Page"
        aria-current-label="Current page"
      >
      </b-pagination>
    </section>
  </div>
</template>

<script>
import date from '@/mixins/date.js';

export default {
  name: 'TrashTable',
  data() {
    return {
      total: 0,
      page: 1,
      trash: [],
    };
  },
  mixins: [date],
  methods: {
    reload(text='') {
      if (text) {
        this.$buefy.toast.open({
          message: text,
          type: 'is-success',
          duration: 3000,
        });
      }
      this.page = 1;
      this.$fetch();
    },
    async rename(id, title) {
      const { result } = await this.$buefy.dialog.prompt({
        message: `To what would you like to rename the item "${title}"?`,
        inputAttrs: {
          placeholder: 'e.g. What is a Sonata?',
        },
        type: 'is-success',
        trapFocus: true,
      });

      if (result) {
        await this.$axios
          .$put(`/api/admin/trash/rename/${id}`, {title: result})
          .then(() => this.reload('Item renamed'))
          .catch((e) => {
            console.log(e.stack);
            this.$buefy.toast.open({
              message: 'There was an error',
              type: 'is-danger',
              duration: 3000,
            });
          });
      } else {
        this.$buefy.toast.open({message: 'Canceled rename', type: 'is-danger', duration: 3000});
      }
    },
    async restore(id, type) {
      const conflict_message = (type == 'article')
        ? 'There already exists an article with the same slug. Rename one of them to resolve the conflict. Aborting.'
        : 'There already exists a draft associated with that article. Aborting.';
      await this.$axios
        .$post(`/api/admin/trash/restore/${id}`)
        .then(() => this.reload(`Item moved to ${type + 's'}`))
        .catch((e) => {
          if (e.response?.status === 409) {
            this.$buefy.dialog.alert({
              title: 'Conflict',
              message: conflict_message,
              type: 'is-danger',
              hasIcon: true,
              ariaRole: 'alertdialog',
              ariaModal: true,
            });
          } else {
            console.log(e.stack);
            this.$buefy.toast.open({
              message: 'There was an error',
              type: 'is-danger',
              duration: 3000,
            });
          }
        });
    },
    async delete_item(id) {
      await this.$axios
        .$delete(`/api/admin/trash/${id}`)
        .then(() => this.reload('Item has been permanently deleted'))
        .catch(() => {
          this.$buefy.toast.open({
            message: 'There was an error',
            type: 'is-danger',
            duration: 3000,
          });
        });
    },
  },
  async fetch() {
    this.total = await this.$axios
      .$get('/api/admin/trash/count')
      .then((res) => res.count)
      .catch((e) => console.log(e.stack));
    this.trash = await this.$axios
      .$get(`/api/admin/trash?page=${this.page}&count=40`)
      .catch((e) => console.log(e.stack));
  },
};
</script>