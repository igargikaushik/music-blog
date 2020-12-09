export const state = () => ({
  user: null
})

export const mutations = {
  SET_USER(state, user){
    state.user = user;
  }
}

export const actions = {
  async nuxtServerInit({ commit }) {
    await this.$axios.$get('/api/admin/user')
      .then(response => commit('SET_USER', response.user))
      .catch(e => console.log(e.stack));
  }
}