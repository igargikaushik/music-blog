<template>
  <div id="edit-article">
    <b-navbar>
      <template slot="brand">
        <b-navbar-item tag="nuxt-link" to="/admin">
          <h2 class="subtitle">Dashboard</h2>
        </b-navbar-item>
      </template>
      <template slot="start">
        <div class="tabs is-toggle is-fullwidth">
          <ul>
            <li :class="{ 'is-active': tab == 'meta' }">
              <a @click="tab = 'meta'">Meta</a>
            </li>
            <li :class="{ 'is-active': tab == 'content' }">
              <a @click="tab = 'content'">Content</a>
            </li>
            <li :class="{ 'is-active': tab == 'listening_guide' }">
              <a @click="tab = 'listening_guide'">Listening Guide</a>
            </li>
          </ul>
        </div>
      </template>

      <template slot="end">
        <b-navbar-item tag="div">
          <div class="buttons">
            <a
              class="button is-light"
              @click="save"
              v-shortkey.once="['ctrl', 's']"
              @shortkey="save"
            >
              Save
            </a>
            <PublishButton
              :id="$route.params.id"
              :title="title"
              :body="{
                title,
                author,
                description,
                content,
                category,
                tags,
                image,
              }"
              @redirect="publish_redirect = true"
            />
          </div>
        </b-navbar-item>
      </template>
    </b-navbar>

    <EditListeningGuide v-show="tab == 'listening_guide'" />
    <EditDraftMeta v-if="tab == 'meta'" :title.sync="title" :category.sync="category" :description.sync="description" :tags.sync="tags" :image.sync="image" :author.sync="author" />
    <EditDraftContent v-if="tab == 'content'" :content.sync="content" v-bind="{title, author, description, tags, category}" />
  </div>
</template>

<script>
export default {
  layout: 'admin',
  data() {
    return {
      title: '',
      category: '',
      tags: [],
      image: null,
      author: '',
      description: '',
      content: '',
      tab: 'meta',
      publish_redirect: false,
    };
  },
  mounted: function () {
    this.publish_redirect = false;
  },
  beforeRouteLeave(to, from, next) {
    if (this.publish_redirect) {
      next();
      return;
    }

    const answer = window.confirm(
      'Do you really want to leave? you have unsaved changes!'
    );
    if (answer) {
      next();
    } else {
      next(false);
    }
  },
  async fetch() {
    const id = this.$route.params.id;
    const draft = await this.$axios
      .$get(`/api/admin/drafts/${id}`)
      .catch((e) => console.log(e.stack));
    for (const key in draft) {
      this[key] = draft[key];
    }
  },
  methods: {
    async save() {
      const id = this.$route.params.id;
      const body = {
        title: this.title,
        author: this.author,
        description: this.description,
        content: this.content,
        category: this.category,
        tags: this.tags,
        image: this.image,
      };
      await this.$axios
        .$put(`/api/admin/drafts/${id}`, body)
        .then(() =>
          this.$buefy.toast.open({
            message: 'Draft saved',
            type: 'is-success',
            duration: 3000,
          })
        )
        .catch((e) => {
          console.log(e.stack);
          this.$buefy.toast.open({
            message: 'There was an error',
            type: 'is-danger',
            duration: 3000,
          });
        });
    },
  },
  head() {
    return {
      title: `Edit - ${this.title} - Classical For Everyone`,
    };
  }
};
</script>

<style lang="scss">
#edit-article {
  position: absolute;
  width: 100%;

  nav {
    z-index: 1;
  }
}
</style>

<style scoped lang="scss">
.section {
  padding: 0;
}
</style>