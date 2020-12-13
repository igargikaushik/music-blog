<template>
  <div class="admin-dashboard container">
    <section>
      <table class="table is-fullwidth has-text-left">
        <thead>
          <tr>
            <th>Title</th>
            <th>Creation date</th>
            <th>Author</th>
            <th>Status</th>
            <th>
              <b-button type="is-success" icon-left="plus" @click="click_new">New</b-button>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="article in articles" :key="article.id">
            <td>{{ article.title }}</td>
            <td>{{ date(article.creation_time) }}</td>
            <td>{{ article.author }}</td>
            <td class="is-narrow">{{ article.is_draft ? "Draft" : "Published" }}</td>
            <td v-if="article.is_draft">
              <div class="buttons">
                <b-button tag="nuxt-link" :to="'/admin/article/' + article.id">Edit</b-button>
                <b-button type="is-success">Publish</b-button>
              </div>
            </td>
            <td v-else>
              <b-button tag="nuxt-link" :to="'/admin/draft/' + article.id">Edit as draft</b-button>
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<script>
export default {
  layout: 'admin',
  data() {
    return {
      articles: [],
    };
  },
  methods: {
    date(timestamp) {
      let date_obj = new Date(timestamp);
      const options = { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' };
      return date_obj.toLocaleDateString("en-US", options);
    },
    click_new() {
      this.$buefy.dialog.confirm({
          message: 'Are you sure you want to make a new article?',
          type: 'is-success',
          onConfirm: () => this.new_draft()
      });
    },
    async new_draft() {
      const new_id = await this.$axios
        .$post("/api/admin/draft")
        .then(draft => draft.id)
        .catch((e) => console.log(e.stack));
      this.$router.push(`/admin/draft/${new_id}`);
    }
  },
  async fetch() {
    this.articles = await this.$axios
      .$get("/api/admin/articles")
      .catch((e) => console.log(e.stack));
  },
};
</script>