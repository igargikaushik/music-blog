<template>
  <div id="dashboard-content">
    <section>
      <table class="table is-fullwidth has-text-left">
        <thead>
          <tr>
            <th>Title</th>
            <th>Category</th>
            <th>Created</th>
            <th>Modified</th>
            <th>Author</th>
            <th>Article</th>
            <th>
              <NewDraftButton />
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="draft in drafts" :key="draft.id">
            <td>{{ draft.title }}</td>
            <td>{{ draft.category }}</td>
            <td>{{ date(draft.creation_time) }}</td>
            <td>{{ date(draft.modified_time) }}</td>
            <td>{{ draft.author }}</td>
            <td>
              <NuxtLink v-if="draft.article_slug" :to="'/article/' + draft.article_slug">Article</NuxtLink>
              <span v-else>N/A</span>
            </td>
            <td>
              <span class="buttons">
                <b-button tag="nuxt-link" :to="'/admin/draft/' + draft.id"
                  >Edit</b-button
                >
                <PublishButton
                  :id="draft.id.toString()"
                  :title="draft.title"
                />

                <b-dropdown aria-role="list" position="is-bottom-left">
                  <b-icon slot="trigger" icon="dots-vertical"></b-icon>
                  <ConfirmButton
                    verb="delete"
                    kind="draft"
                    :title="draft.title"
                    text="Delete"
                    @confirm="delete_draft(draft.id)"
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
  name: "DraftsTable",
  data() {
    return {
      total: 0,
      page: 1,
      drafts: [],
    };
  },
  mixins: [date],
  methods: {
    delete_draft(id) {},
  },
  async fetch() {
    this.total = await this.$axios
      .$get("/api/admin/drafts/count")
      .then((res) => res.count)
      .catch((e) => console.log(e.stack));
    this.drafts = await this.$axios
      .$get(`/api/admin/drafts?page=${this.page}&count=40`)
      .catch((e) => console.log(e.stack));
  },
};
</script>