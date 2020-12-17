export const state = () => ({
  user: null
})

export const mutations = {
  SET_USER(state, user){
    state.user = user;
  }
}

export const actions = {
  // TODO: Is this calling at the right time on prod?
  // This could cause the blocking of /admin despite being logged it
  // i.e. maybe it's just a major delay
  async nuxtServerInit({ commit }) {
    await this.$axios.$get('/api/admin/user')
      .then(response => commit('SET_USER', response.user))
      .catch(e => console.log(e.stack));
  }
}