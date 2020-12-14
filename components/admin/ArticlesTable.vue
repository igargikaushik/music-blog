<template>
  <div id="dashboard-content">
    <section>
      <table class="table is-fullwidth has-text-left">
        <thead>
          <tr>
            <th>Title</th>
            <th>Category</th>
            <th>Creation date</th>
            <th>Author</th>
            <th>Status</th>
            <th>
              <b-button type="is-success" icon-left="plus" @click="click_new"
                >New</b-button
              >
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="article in articles" :key="article.id">
            <td>{{ article.title }}</td>
            <td>{{ article.category }}</td>
            <td>{{ date(article.creation_time) }}</td>
            <td>{{ article.author }}</td>
            <td>{{ article.is_draft ? "Draft" : "Published" }}</td>
            <td>
              <span class="buttons" v-if="article.is_draft">
                <b-button tag="nuxt-link" :to="'/admin/draft/' + article.id"
                  >Edit</b-button
                >
                <PublishButton
                  :id="article.id.toString()"
                  :title="article.title"
                />
              </span>
              <span class="buttons" v-else>
                <b-button tag="nuxt-link" :to="'/admin/article/' + article.id"
                  >Edit as draft</b-button
                >

                <b-dropdown aria-role="list">
                  <b-icon slot="trigger" icon="dots-vertical"></b-icon>
                  <b-dropdown-item
                    aria-role="listitem"
                    @click="
                      confirm(archive, 'archive', article.id, article.title)
                    "
                    >Archive</b-dropdown-item
                  >
                  <b-dropdown-item
                    aria-role="listitem"
                    @click="
                      confirm(
                        unpublish,
                        'unpublish',
                        article.id,
                        article.title
                      )
                    "
                    >Unpublish</b-dropdown-item
                  >
                  <b-dropdown-item
                    aria-role="listitem"
                    @click="
                      confirm(
                        delete_article,
                        'delete',
                        article.id,
                        article.title
                      )
                    "
                    >Delete</b-dropdown-item
                  >
                </b-dropdown>
              </span>
            </td>
          </tr>
        </tbody>
      </table>
      <b-pagination
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
import date from '@/mixins/date.js';

export default {
  data() {
    return {
      total: 0,
      page: 1,
      articles: [],
    };
  },
  mixins: [date],
  methods: {
    click_new() {
      this.$buefy.dialog.confirm({
        message: "Are you sure you want to make a new draft?",
        type: "is-success",
        onConfirm: () => this.new_draft(),
      });
    },
    async new_draft() {
      const new_id = await this.$axios
        .$post("/api/admin/draft")
        .then((draft) => draft.id)
        .catch((e) => console.log(e.stack));
      this.$router.push(`/admin/draft/${new_id}`);
    },
    confirm(f, verb, id, title) {
      this.$buefy.dialog.confirm({
        type: "is-danger",
        hasIcon: true,
        message: `Are you sure you want to ${verb} the article "${title}"?`,
        type: "is-danger",
        onConfirm: () => f(id),
      });
    },
    archive() {},
    unpublish() {},
    delete_article() {},
  },
  async fetch() {
    console.log("Fetching articles");
    this.total = await this.$axios
      .$get("/api/admin/articles/count")
      .then((res) => res.count)
      .catch((e) => console.log(e.stack));
    this.articles = await this.$axios
      .$get("/api/admin/articles")
      .catch((e) => console.log(e.stack));
  },
};
</script>