<template>
  <div class="home">
    <NavBar />
    <Hero />
    <TileContainer :articles="articles" />
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
      :per-page="per_page"
      order="is-centered"
      :total="total"
      v-model="page"
      aria-next-label="Next page"
      aria-previous-label="Previous page"
      aria-page-label="Page"
      aria-current-label="Current page"
    >
    </b-pagination>
  </div>
</template>

<script>
import NavBar from '@/components/header/NavBar.vue';
import Hero from '@/components/header/Hero.vue';
import TileContainer from '@/components/tiles/TileContainer.vue';

export default {
  name: 'Home',
  layout: 'home',
  components: {
    NavBar,
    Hero,
    TileContainer,
  },
  data() {
    return {
      total: 0,
      page: 1,
      per_page: 12,
      articles: [],
    };
  },
  async fetch() {
    this.total = await this.$axios
      .$get('/api/articles/count')
      .then((res) => res.count)
      .catch((e) => console.log(e.stack));
    await this.$axios
      .$get(`/api/articles?page=${this.page}&count=${this.per_page}`)
      .then(async articles => {
        await Promise.all(articles.map(async article => {
          if (article.image) {
            await this.$axios
              .$get(`/api/storage/alt?file=${article.image}`)
              .then(res => {
                if (res.alt) article.alt = `${res.alt}`;
              })
              .catch(() => {});
          }
        }));
        this.articles = articles;
      })
      .catch((e) => console.log(e.stack));
  },
};
</script>

<style scoped lang="scss">
.home {
  margin-top: -68px;
  flex-grow: 1;
}

nav.sticky {
  background-color: #504A41 !important;
}

body {
  padding-top: 0 !important;
}
</style>