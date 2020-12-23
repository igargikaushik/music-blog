<template>
  <div id="article-main" class="article">
    <section class="section">
      <div class="container">
        <ArticleHeader :title="article.title" :author="article.author" :description="article.description" />
        <div class="columns">
          <div class="column"></div>
          <div class="column is-three-quarters has-text-left">
            <ArticleContent :content="article.content" />
            <ShareTags :category="article.category" :tags="article.tags" />
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
  name: 'Article',
  components: {
    ArticleContent,
    ArticleHeader,
  },
  async asyncData({ params, $axios }) {
    const article = await $axios
      .$get(`/api/articles/${params.slug}`)
      .catch((e) => console.log(e.stack));
    return { article };
  },
};
</script>

<style scoped lang="scss">
@import "~bulma/sass/utilities/initial-variables";

#article-main {
  flex-grow: 1;
}

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