<template>
  <b-navbar :class="[{sticky: scroll > 40}, {'on-home': $nuxt.$route.path == '/'}, 'is-fixed-top']">
    <template slot="brand">
      <b-navbar-item tag="NuxtLink" :to="{ path: '/' }">
        <h1 class="title" style="color: white">LOGO</h1>
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
@import "~bulma/sass/utilities/initial-variables";

nav {
  background-color: #504A41;
}

nav.on-home {
  height: auto;
  background-color: transparent !important;
  opacity: 1.0;
  transition: height 0s 0.2s, background-color 0.2s ease-in-out, box-shadow 0.2s;
}

@media screen and (max-width: $tablet) {
  nav.on-home:not(.sticky) {
    opacity: 0;
    min-height: 0;
    height: 0;
    overflow: hidden;
    transition: min-height 0s linear 0.2s, height 0s 0.2s, background-color 0.2s ease-in-out, opacity 0.2s;
  }
}

.navbar-item {
  padding: 1rem 1.5rem;
}
</style>