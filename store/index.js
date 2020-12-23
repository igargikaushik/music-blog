export const state = () => ({
  user: null,
  articles_pages: {},
  articles: [],
  articles_count: 0,
  loading_articles: false,
});

export const mutations = {
  SET_USER(state, user){
    state.user = user;
  },
  SET_ARTICLES(state, articles) {
    state.articles = articles;
  },
  SET_ARTICLES_PAGE(state, payload) {
    state.articles_pages[payload.page] = payload.articles;
  },
  SET_ARTICLES_COUNT(state, payload) {
    state.articles_count = payload.count;
  },
  SET_LOADING_ARTICLES(state, loading_articles) {
    state.loading_articles = loading_articles.loading_articles;
  },
};

export const actions = {
  // TODO: Is this calling at the right time on prod?
  // This could cause the blocking of /admin despite being logged it
  // i.e. maybe it's just a major delay
  async nuxtServerInit({ commit }) {
    await this.$axios.$get('/api/admin/user')
      .then(response => commit('SET_USER', response.user))
      .catch(e => console.log(e.stack));
  },
  async getArticlesCount({ commit}) {
    await this.$axios.$get('/api/articles/count')
      .then(response => commit('SET_ARTICLES_COUNT', response))
      .catch(e => console.log(e.stack));
  },
  async getArticles({ commit, state }, payload) {
    if (!(payload.page in state.articles_pages)) {
      commit('SET_LOADING_ARTICLES', { loading_articles: true });
      const articles = await this.$axios
        .$get(`/api/articles?page=${payload.page}&count=${payload.per_page}`)
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
          return articles;
        })
        .catch((e) => console.log(e.stack));
      commit('SET_ARTICLES_PAGE', { page: payload.page, articles });
      commit('SET_LOADING_ARTICLES', { loading_articles: false });
    }
    commit('SET_ARTICLES', state.articles_pages[payload.page]);
    if (payload.callback) payload.callback();
  },
};