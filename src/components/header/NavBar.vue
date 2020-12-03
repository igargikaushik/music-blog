<template>
  <b-navbar :class="[{sticky: scroll > 40}, 'is-fixed-top']">
    <template slot="brand">
      <b-navbar-item>
        <router-link to="/" class="navbar-item">
          <h1 class="title" style="color: white">LOGO</h1>
        </router-link>
      </b-navbar-item>
    </template>
  </b-navbar>
</template>

<script>
export default {
  name: "NavBar",
  mounted() {
    document.addEventListener('scroll', this.handleScroll);
  },
  beforeDestroy() {
    document.removeEventListener('scroll', this.handleScroll);
  },
  data() {
    return { scroll: 0 };
  },
  methods: {
    handleScroll: function(e) {
      this.scroll = e.target.scrollingElement.scrollTop;
    }
  }
};
</script>

<style scoped lang="scss">
@import "~bulma/sass/utilities/_all";

nav {
  background-color: #504A41;
}
</style>