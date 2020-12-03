<template>
  <body id="app" :class="{ 'has-navbar-fixed-top': notHome() }">
    <NavBar v-if="notHome()" />
    <router-view />
    <Footer />
  </body>
</template>

<script>
import NavBar from './components/header/NavBar.vue'
import Footer from './components/Footer.vue'

export default {
  name: 'TileContainer',
  components: {
    NavBar,
    Footer,
  },
  methods: {
    notHome: function() {
      return this.$router.history.current['path'] !== '/';
    }
  }
}
</script>

<style lang="scss">
@import "~bulma/sass/utilities/_all";
@import "~bulma";
@import "~buefy/src/scss/buefy";

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>