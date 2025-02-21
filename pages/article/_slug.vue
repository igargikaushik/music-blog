<template>
  <div id="article-main" class="article">
    <section class="section">
      <div class="container">
        <ArticleHeader :id="article.id" :title="article.title"
          :author="article.author" :description="article.description" />
        <div class="columns">
          <div class="column"></div>
          <div class="column is-three-quarters has-text-left">
            <ArticleContent :content="article.content" />
            <ListeningGuidePlayer v-if="article.listening_guide && article.listening_guide.videos"
              v-bind="article.listening_guide" />
            <ShareTags :category="article.category" :tags="article.tags"
              :title="article.title" :description="article.description" />
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
  async asyncData({ params, redirect, error, $axios }) {
    const article = await $axios
      .$get(`/api/articles/${params.slug}`)
      .catch(async () => {});
    if (!article) {
      const response = await $axios
        .get(`/api/redirect/${params.slug}`)
        .catch((e) => console.log(e.stack));
      if (response?.data?.to_slug) {
        return redirect(301, `/article/${response.data.to_slug}`);
      } else {
        return error({ statusCode: 404, message: 'Article not found' });
      }
    }

    if (article.listening_guide?.videos) {
      const player_videos_by_type = {};
      for (const [index, video] of article.listening_guide.videos.entries()) {
        const { type, name, timestamps, video_id, start_time, end_time } = video;
        player_videos_by_type[type] = (player_videos_by_type[type] || [])
          .concat([{ id: index, name, video_id, start_time, end_time, timestamps }]);
      }
      article.listening_guide.videos = Object.keys(player_videos_by_type).map(name => {
        return { type: name, entries: player_videos_by_type[name] };
      });
    }
    return { article };
  },
  head() {
    return {
      title: `${this.article.title} - Classical For Everyone`,
      meta: [
        {
          hid: 'description', name: 'description',
          content: this.article.description
        },
        {
          hid: 'twitter:card', name: 'twitter:card',
          content: 'summary'
        },
        {
          hid: 'twitter:site', name: 'twitter:site',
          content: '@classicalevery1'
        },
        {
          hid: 'twitter:title', name: 'twitter:title',
          content: this.article.title
        },
        {
          hid: 'twitter:description', name: 'twitter:description',
          content: this.article.description
        },
        {
          hid: 'twitter:image', name: 'twitter:image',
          content: `https://www.classicalforeveryone.com${encodeURI(this.article.image)}`
        },
        {
          hid: 'twitter:image:alt', name: 'twitter:image:alt',
          content: this.article.title
        },
        {
          hid: 'og:title', property: 'og:title',
          content: this.article.title
        },
        {
          hid: 'og:description', property: 'og:description',
          content: this.article.description
        },
        {
          hid: 'og:image', property: 'og:image',
          content: `https://www.classicalforeveryone.com${encodeURI(this.article.image)}`
        },
        {
          hid: 'og:image:secure_url', property: 'og:image:secure_url',
          content: `https://www.classicalforeveryone.com${encodeURI(this.article.image)}`
        },
        {
          hid: 'og:image:alt', property: 'og:image:alt',
          content: this.article.title
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