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
export default {
  name: 'Article',
  async asyncData({ params, error, $axios }) {
    const article = await $axios
      .$get(`/api/articles/${params.slug}`)
      .catch(() => error({ statusCode: 404, message: 'Article not found' }));
    return { article };
  },
  head() {
    return {
      title: `${this.article.title} - Classical For Everyone`,
      meta: [
        {
          hid: 'description', name: 'description',
          content: this.article.description
        }
      ]
    };
  }
};
</script>

<style lang="scss">
@import "~bulma/sass/utilities/initial-variables";

@media screen and (max-width: $tablet) {
  .column:empty {
    display: none;
  }
}
</style>

<style scoped lang="scss">
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
</style>