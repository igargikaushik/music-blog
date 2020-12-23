<template>
  <div class="home">
    <NavBar />
    <Hero />
    <TileContainer :articles="articles" />
    <div
      v-if="loading"
      style="position: relative; height: 60px; margin-bottom: 1.5rem"
    >
      <b-loading :is-full-page="false" v-model="loading"></b-loading>
    </div>
    <b-pagination
      v-else
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
import { mapActions, mapState } from 'vuex';

export default {
  name: 'Home',
  layout: 'home',
  computed: {
    ...mapState({
      articles: 'articles',
      loading: 'loading_articles',
      total: 'articles_count',
    }),
  },
  methods: {
    ...mapActions(['getArticles', 'getArticlesCount']),
  },
  created() {
    this.getArticlesCount();
    this.getArticles({ page: this.page, per_page: this.per_page });
  },
  data() {
    return {
      page: 1,
      per_page: 12,
    };
  },
  watch: {
    page: function (val) {
      this.getArticles({ page: val, per_page: this.per_page });
    },
  },
};
</script>

<style scoped lang="scss">
.home {
  margin-top: -68px;
  flex-grow: 1;
}

nav.sticky {
  background-color: #504a41 !important;
}

body {
  padding-top: 0 !important;
}

.pagination {
  max-width: 400px;
  margin: auto;
}
</style>