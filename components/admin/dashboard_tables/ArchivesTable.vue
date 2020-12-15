<template>
  <div id="dashboard-content">
    <section>
      <table class="table is-fullwidth has-text-left">
        <thead>
          <tr>
            <th>Title</th>
            <th>Category</th>
            <th>Archived</th>
            <th>Published</th>
            <th>Updated</th>
            <th>Author</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="archive in archives" :key="archive.id">
            <td>{{ archive.title }}</td>
            <td>{{ archive.category }}</td>
            <td>{{ date(archive.archive_time) }}</td>
            <td>{{ date(archive.creation_time) }}</td>
            <td>{{ archive.update_time ? date(archive.update_time) : 'N/A' }}</td>
            <td>{{ archive.author }}</td>
            <td>
              <span class="buttons">
                <b-dropdown aria-role="list" position="is-bottom-left">
                  <b-icon slot="trigger" icon="dots-vertical"></b-icon>
                  <b-dropdown-item
                    aria-role="listitem"
                    @click="rename(archive.id, archive.title)">
                    Rename
                  </b-dropdown-item>
                  <ConfirmButton
                    verb="republish"
                    kind="archive"
                    :title="archive.title"
                    text="Republish"
                    @confirm="republish(archive.id)"
                  />
                  <ConfirmButton
                    verb="delete"
                    kind="archive"
                    :title="archive.title"
                    text="Delete"
                    @confirm="delete_archive(archive.id)"
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
import date from "@/mixins/date.js";

export default {
  name: "ArchivesTable",
  data() {
    return {
      total: 0,
      page: 1,
      archives: [],
    };
  },
  mixins: [date],
  methods: {
    reload(text='') {
      if (text) {
        this.$buefy.toast.open({
          message: text,
          type: "is-success",
          duration: 3000,
        });
      }
      this.page = 1;
      this.$fetch();
    },
    async rename(id, title) {
      const { result, dialog } = await this.$buefy.dialog.prompt({
        message: `To what would you like to rename the archive "${title}"?`,
        inputAttrs: {
          placeholder: "e.g. What is a Sonata?",
        },
        type: "is-success",
        trapFocus: true,
      });

      if (result) {
        await this.$axios
          .$put(`/api/admin/archives/rename/${id}`, {title: result})
          .then(res => this.reload("Archive renamed"))
          .catch((e) => {
            console.log(e.stack);
            this.$buefy.toast.open({
              message: "There was an error",
              type: "is-danger",
              duration: 3000,
            });
          });
      } else {
        this.$buefy.toast.open({message: `Canceled rename`, type: 'is-danger', duration: 3000})
      }
    },
    async republish(id) {
      await this.$axios
        .$post(`/api/admin/archives/republish/${id}`)
        .then(res => this.reload("Archive moved to articles"))
        .catch((e) => {
          if (e.response?.status === 409) {
            this.$buefy.dialog.alert({
              title: "Conflict",
              message:
                `There already exists an article with the same slug. Rename one of them to resolve the conflict. Aborting.`,
              type: "is-danger",
              hasIcon: true,
              ariaRole: "alertdialog",
              ariaModal: true,
            });
          } else {
            console.log(e.stack);
            this.$buefy.toast.open({
              message: "There was an error",
              type: "is-danger",
              duration: 3000,
            });
          }
        });
    },
    async delete_archive(id) {
      await this.$axios
        .$delete(`/api/admin/archives/${id}`)
        .then(res => this.reload("Archive moved to trash"))
        .catch((e) => {
          this.$buefy.toast.open({
            message: "There was an error",
            type: "is-danger",
            duration: 3000,
          });
        });
    },
  },
  async fetch() {
    this.total = await this.$axios
      .$get("/api/admin/archives/count")
      .then((res) => res.count)
      .catch((e) => console.log(e.stack));
    this.archives = await this.$axios
      .$get(`/api/admin/archives?page=${this.page}&count=40`)
      .catch((e) => console.log(e.stack));
  },
};
</script>