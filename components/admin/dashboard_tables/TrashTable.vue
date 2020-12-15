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
                  <ConfirmButton
                    verb="restore"
                    :kind="item.doc_type"
                    :title="item.title"
                    text="Restore"
                    @confirm="restore(item.id)"
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
        per-page="40"
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
  name: "TrashTable",
  data() {
    return {
      total: 0,
      page: 1,
      trash: [],
    };
  },
  mixins: [date],
  methods: {
    restore(id) {},
    delete_item(id) {},
    delete_multiple(id_list) {},
  },
  async fetch() {
    this.total = await this.$axios
      .$get("/api/admin/trash/count")
      .then((res) => res.count)
      .catch((e) => console.log(e.stack));
    this.trash = await this.$axios
      .$get(`/api/admin/trash?page=${this.page}&count=40`)
      .catch((e) => console.log(e.stack));
  },
};
</script>