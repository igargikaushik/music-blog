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
            <td>{{ date(archive.update_time) }}</td>
            <td>{{ archive.author }}</td>
            <td>
              <span class="buttons">
                <b-dropdown aria-role="list" position="is-bottom-left">
                  <b-icon slot="trigger" icon="dots-vertical"></b-icon>
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
    republish(id) {},
    delete_archive(id) {},
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