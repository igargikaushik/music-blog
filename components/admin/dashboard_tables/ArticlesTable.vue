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
            <th>Status</th>
            <th>
              <NewDraftButton />
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="article in articles" :key="article.id">
            <td>{{ article.title }}</td>
            <td>{{ article.category }}</td>
            <td>{{ date(article.creation_time) }}</td>
            <td>{{ date(article.modified_time) }}</td>
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

                <b-dropdown aria-role="list" position="is-bottom-left">
                  <b-icon slot="trigger" icon="dots-vertical"></b-icon>
                  <ConfirmButton
                    verb="archive"
                    kind="article"
                    :title="article.title"
                    text="Archive"
                    @confirm="archive(article.id)"
                  />
                  <ConfirmButton
                    verb="unpublish"
                    kind="article"
                    :title="article.title"
                    text="Unpublish"
                    @confirm="unpublish(article.id, article.title)"
                  />
                  <ConfirmButton
                    verb="delete"
                    kind="article"
                    :title="article.title"
                    text="Delete"
                    @confirm="delete_article(article.id)"
                  />
                </b-dropdown>
              </span>
            </td>
          </tr>
        </tbody>
      </table>
      <div
        v-if="$fetchState.pending"
        style="position: relative; height: 60px; margin-bottom: 1.5rem"
      >
        <b-loading
          :is-full-page="false"
          v-model="$fetchState.pending"
        ></b-loading>
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
  name: 'ArticlesTable',
  data() {
    return {
      total: 0,
      page: 1,
      articles: [],
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
    async archive(id) {
      await this.$axios
        .$post(`/api/admin/articles/archive/${id}`)
        .then(() => this.reload('Article moved to archives'))
        .catch((e) => {
          console.log(e.stack);
          this.$buefy.toast.open({
            message: 'There was an error',
            type: 'is-danger',
            duration: 3000,
          });
        });
    },
    async unpublish(id, title) {
      await this.$axios
        .$post(`/api/admin/articles/unpublish/${id}`)
        .then(() => this.reload('Article moved to drafts'))
        .catch((e) => {
          if (e.response?.status === 409) {
            this.$buefy.dialog.alert({
              title: 'Conflict',
              message:
                `The article "${title}" already has a draft. If you would like to unpublish the article, delete the existing draft. Aborting.`,
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
    async delete_article(id) {
      await this.$axios
        .$delete(`/api/admin/articles/${id}`)
        .then(() => this.reload('Article moved to trash'))
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
    // TODO: Potentially save visited pages and maybe use store
    // Same for drafts
    this.total = await this.$axios
      .$get('/api/admin/articles/count')
      .then((res) => res.count)
      .catch((e) => console.log(e.stack));
    this.articles = await this.$axios
      .$get(`/api/admin/articles?page=${this.page}&count=40`)
      .catch((e) => console.log(e.stack));
  },
};
</script>