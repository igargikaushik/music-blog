<template>
  <div class="article">
    <section class="section">
      <div class="container">
        <div class="columns">
          <div class="column"></div>
          <div class="column is-two-fifths">
            <p class="title">{{ title }}</p>
            <p class="title">{{ test }}</p>
            <p class="subtitle mb-2">by {{ author }}</p>
            <i>{{ description }}</i>
          </div>
          <div class="column"></div>
        </div>
        <div class="columns">
          <div class="column"></div>
          <div class="column is-three-quarters has-text-left">
            <markdown-it-vue
              class="content md-body"
              ref="markdownIt"
              :content="content"
              :options="options"
            />
            <div class="columns" id="media-tags">
              <div class="column is-one-third">
                <div class="box">
                  <strong class="title is-5">Share:</strong>
                  <br />
                  <span class="icon has-text-info mt-3 ml-2 mr-3">
                    <i class="fab fa-twitter-square fa-3x"></i>
                  </span>
                  <span class="icon has-text-info mt-3 ml-5 mr-3">
                    <i class="fab fa-facebook-square fa-3x"></i>
                  </span>
                  <span class="icon has-text-info mt-3 ml-5">
                    <i class="fab fa-reddit-square fa-3x"></i>
                  </span>
                </div>
              </div>

              <div class="column">
                <div class="box">
                  <div class="field is-grouped is-grouped-multiline">
                    <label class="label">Category:</label>
                    <div class="control">
                      <div class="tags has-addons">
                        <a class="tag is-link">Article</a>
                      </div>
                    </div>
                  </div>
                  <div class="field is-grouped is-grouped-multiline">
                    <label class="label">Tags:</label>
                    <div class="control">
                      <div class="tags has-addons">
                        <a class="tag is-light">Sonata</a>
                      </div>
                    </div>
                    <div class="control">
                      <div class="tags has-addons">
                        <a class="tag is-light">Classical</a>
                      </div>
                    </div>
                    <div class="control">
                      <div class="tags has-addons">
                        <a class="tag is-light">Romantic</a>
                      </div>
                    </div>
                    <div class="control">
                      <div class="tags has-addons">
                        <a class="tag is-light">Modern</a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="column"></div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import axios from "axios";
import MarkdownItVue from "markdown-it-vue";
const markdownItClass = require("@toycode/markdown-it-class");
const markdownItToc = require("markdown-it-table-of-contents");

export default {
  name: "Home",
  data() {
    return {
      title: "What is a Sonata?",
      test: "",
      author: "Henry Sloan",
      description:
        'Many of the most popular classical works are "Sonatas". Let\'s look at what that means, and how we can navigate this vast genre.',
      options: { markdownIt: { html: true } },
      content: `
[[toc]]

# Introduction
What do Mozart and Beethoven have in common? Well, among other things, they both have "sonatas" among their most famous works. I'll bet you've heard this piece by Mozart:

<audio controls="controls" src="https://upload.wikimedia.org/wikipedia/commons/3/38/Wolfgang_Amadeus_Mozart_-_sonata_no._16_in_c_major%2C_k.545_%27sonata_facile%27_-_i._allegro.ogg"></audio>

And this wild work of Beethoven:

<audio controls="controls" src="https://upload.wikimedia.org/wikipedia/commons/1/1d/Moonlight_Sonata_Presto.ogg"></audio>

These two pieces are about as different as you can get within the classical-era piano repertoire, but they have **two things** in common.
1. They're movements in "piano sonatas"
2. They're in sonata form

That's right, "sonata" means two different, but closely related, things. This might seem confusing, but learning the meanings of these two ideas will do wonders to open your ears to classical music. Let's look at the definitions of "sonata" and see how this abstract idea leads us through the past 400 years of musical evolution.

# Sonata vs. Sonata Form
What is the difference? There is a difference. What is it. It is.

# History of the Sonata
There is history. What is it? It is.

# Suggestions
Listen! To what? Well, listen, and I'll tell you! It is.
`,
    };
  },
  created() {
    this.fetchTest();
  },
  mounted() {
    const mapping = { h1: "title" };
    const toc_options = {
      containerClass: "box markdown-toc",
      containerHeaderHtml: "<strong>Contents</strong>",
      listType: "ol",
      slugify: (s) =>
        encodeURIComponent(
          String(s)
            .trim()
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[./]+/g, "")
        ),
    };
    this.$refs.markdownIt.use(markdownItClass, mapping);
    this.$refs.markdownIt.use(markdownItToc, toc_options);
  },
  watch: {
    $route: "fetchTest",
  },
  methods: {
    fetchTest: function () {
      const API_URL = "/api";
      let uri = `${API_URL}`;
      axios.get(uri).then((response) => {
        this.test = response.data;
      });
    },
  },
  components: {
    MarkdownItVue,
  },
};
</script>

<style lang="scss">
// Unscoped styles for markdown
.markdown-toc ol {
  margin: 0;
  padding-left: 16px;
}

.markdown-body {
  p:empty {
    display: none;
  }

  h1::before {
    content: '';
    display: block;
    height:      75px;
    margin-top: -75px;
    visibility: hidden;
  }
}
</style>

<style scoped lang="scss">
@import "~bulma/sass/utilities/_all";

#title-area {
  display: flex;
  justify-content: center;
}

.label {
  padding-right: 8px;
}

#media-tags {
  .column {
    display: flex;
    align-items: stretch;
    flex-flow: column;
    min-width: 250px;
  }

  .box {
    height: 100%;
    vertical-align: middle;
    padding-bottom: 4px;
  }
}

@media screen and (max-width: $tablet) {
  .column:empty {
    display: none;
  }
}
</style>