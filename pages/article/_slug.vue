<template>
  <div class="article">
    <section class="section">
      <div class="container">
        <div v-if="$fetchState.pending" class="columns has-text-centered">
          <div class="column"></div>
          <div class="column has-text-centered">
            <b-skeleton position="is-centered"></b-skeleton>
            <b-skeleton position="is-centered" width="80%"></b-skeleton>
            <b-skeleton position="is-centered" width="90%"></b-skeleton>
          </div>
          <div class="column"></div>
        </div>
        <ArticleHeader v-else :title="title" :author="author" :description="description" />
        <div class="columns">
          <div class="column"></div>
          <div class="column is-three-quarters has-text-left">
            <ArticleContent :content="content" />
            <ShareTags :category="category" :tags="tags" />
          </div>
          <div class="column"></div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import ArticleContent from '@/components/article/ArticleContent.vue';
import ArticleHeader from '@/components/article/ArticleHeader.vue';

export default {
  name: 'Home',
  components: {
    ArticleContent,
    ArticleHeader,
  },
  data() {
    return {
      title: '',
      author: '',
      description: '',
      category: '',
      tags: [],
      content: '',
    };
  },
  async fetch() {
    const slug = this.$route.params.slug;
    const article = await this.$axios
      .$get(`/api/articles/${slug}`)
      .catch((e) => console.log(e.stack));
    for (const key in article) {
      this[key] = article[key];
    }
  },
};
</script>

<style scoped lang="scss">
@import "~bulma/sass/utilities/initial-variables";

#title-area {
  display: flex;
  justify-content: center;
}

.section {
  padding-top: 1.75rem;
}

@media screen and (max-width: $tablet) {
  .column:empty {
    display: none;
  }
}
</style>