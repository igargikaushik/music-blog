<template>
  <div id="edit-article">
        <b-navbar>
        <template slot="brand">
            <b-navbar-item tag="router-link" :to="{ path: '/' }">
                <img
                    src="https://raw.githubusercontent.com/buefy/buefy/dev/static/img/buefy-logo.png"
                    alt="Lightweight UI components for Vue.js based on Bulma"
                >
            </b-navbar-item>
        </template>
        <template slot="start">
            <b-navbar-item href="#">
                Home
            </b-navbar-item>
            <b-navbar-item href="#">
                Documentation
            </b-navbar-item>
            <b-navbar-dropdown label="Info">
                <b-navbar-item href="#">
                    About
                </b-navbar-item>
                <b-navbar-item href="#">
                    Contact
                </b-navbar-item>
            </b-navbar-dropdown>
        </template>

        <template slot="end">
            <b-navbar-item tag="div">
                <div class="buttons">
                    <a class="button is-primary">
                        <strong>Sign up</strong>
                    </a>
                    <a class="button is-light">
                        Log in
                    </a>
                </div>
            </b-navbar-item>
        </template>
    </b-navbar>

    <section class="section">
      <div class="columns is-gapless is-fullheight panes">
        <div class="column content-editor">
          <article class="column">
            <div class="box has-text-left">
              <ArticleMetaInput label="Title" v-model="title"/>
              <ArticleMetaInput label="Author" v-model="author"/>
              <ArticleMetaInput textarea label="Description" v-model="description"/>
              <b-taginput
                  v-model="tags"
                  ellipsis
                  icon="label"
                  placeholder="Add a tag"
                  aria-close-label="Delete this tag">
              </b-taginput>
            </div>
          </article>
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
          <Tile disabled v-bind="tile" />
          <ArticleHeader preview class="header" :title="title" :test="test" :author="author" :description="description" />
          <ArticleContent :content="content" />
          <ShareTags :category="category" :tags="tags" />
        </div>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  layout: 'admin',
  data() {
    return {
      title: "Title",
      test: "",
      category: "Article",
      tags: ["Tag 1", "Loooong tag"],
      author: "Author Lastname",
      description: "This is the description!", 
      content: "[[toc]]\n# Header\nTest content",
    }
  },
  computed: {
    tile() {
      return {
        title: this.title,
        slug: "what-sonata",
        imgSrc: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Wolfgang-amadeus-mozart_1.jpg/256px-Wolfgang-amadeus-mozart_1.jpg",
        content: this.description,
        category: this.category,
        tags: this.tags,
      }
    }
  },
  beforeRouteLeave (to, from , next) {
  const answer = window.confirm('Do you really want to leave? you have unsaved changes!')
  if (answer) {
    next()
  } else {
    next(false)
  }
}

};
</script>

<style lang="scss">
.content-input, .content-input:hover, .content-input:active, .content-input:focus {
  border: 0;
  outline: 0;
  resize: none;
  box-shadow: none;
  -webkit-box-shadow: none;
  height: 100%;
  max-height: unset !important;
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

.panes, .content-editor {
  min-height: calc(100vh - 68px*2);
}

.content-editor {
  display: flex;
  flex-flow: column;
}

.control, .content {
  height: 100%;
}

.md-body {
  margin: 8px;
  margin-bottom: 1.5rem;
  height: auto;
}
</style>