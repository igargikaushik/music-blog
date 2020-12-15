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

    <section v-if="tab == 'meta'" class="section">
      <div class="columns is-gapless is-fullheight">
        <div class="column"></div>
        <div class="column is-three-fifths">
          <article class="column">
            <div class="box has-text-left">
              <ArticleMetaInput label="Title" v-model="title" />
              <ArticleMetaInput label="Author" v-model="author" />
              <ArticleMetaInput
                textarea
                label="Description"
                v-model="description"
              />
              <ArticleImageInput v-model="image" />
              <ArticleMetaInput label="Category" v-model="category" />
              <b-taginput
                v-model="tags"
                ellipsis
                icon="label"
                placeholder="Add a tag"
                aria-close-label="Delete this tag"
              >
              </b-taginput>
            </div>
          </article>
          <Tile disabled v-bind="tile" />
        </div>
        <div class="column"></div>
      </div>
    </section>

    <section v-if="tab == 'content'" class="section">
      <div class="columns is-gapless is-fullheight panes">
        <div class="column content-editor">
          <b-input
            custom-class="content-input"
            v-model="content"
            type="textarea"
            spellcheck="false"
            autocapitalize="off"
            autocomplete="off"
            autocorrect="off"
          ></b-input>
        </div>
        <div class="column has-text-left content-preview">
          <ArticleHeader
            preview
            class="header"
            :title="title"
            :author="author"
            :description="description"
          />
          <ArticleContent :content="content" />
          <ShareTags :category="category" :tags="tags" />
        </div>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  layout: "admin",
  data() {
    return {
      title: "",
      category: "",
      tags: [],
      image: null,
      author: "",
      description: "",
      content: "",
      tab: "meta",
      publish_redirect: false,
    };
  },
  computed: {
    tile() {
      return {
        title: this.title,
        imgSrc: this.image,
        content: this.description,
        category: this.category,
        tags: this.tags,
      };
    },
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
      "Do you really want to leave? you have unsaved changes!"
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
        .then((res) =>
          this.$buefy.toast.open({
            message: "Draft saved",
            type: "is-success",
            duration: 3000,
          })
        )
        .catch((e) =>
          this.$buefy.toast.open({
            message: "There was an error",
            type: "is-danger",
            duration: 3000,
          })
        );
    },
  },
};
</script>

<style lang="scss">
.content-input,
.content-input:hover,
.content-input:active,
.content-input:focus {
  border: 0;
  outline: 0;
  resize: none;
  box-shadow: none;
  -webkit-box-shadow: none;
  height: 100%;
  max-height: unset !important;
}

#edit-article nav {
  z-index: 1;
}
</style>

<style scoped lang="scss">
.section {
  padding: 0;
}

.header {
  margin-top: 0;
}

.article-tile {
  max-width: 29.2em;
}

.content-editor {
  border-right: 2px solid #f5f5f5;
}

.content-preview {
  margin-top: 16px;
}

.panes {
  min-height: calc(100vh - 68px * 2);
  padding: 0 8px;
}

.content-editor {
  min-height: calc(100vh - 68px * 2);
  display: flex;
  flex-flow: column;
}

.control,
.content {
  height: 100%;
}

.md-body {
  margin: 8px;
  margin-bottom: 1.5rem;
  height: auto;
}
</style>