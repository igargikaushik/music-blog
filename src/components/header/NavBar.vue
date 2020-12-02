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
  height: auto;
  background-color: transparent;
  opacity: 1.0;
  transition: height 0s 0.2s, background-color 0.2s ease-in-out, box-shadow 0.2s;
}

:not(.hero-head) > nav, nav.sticky {
  background-color: #504A41;
  box-shadow: 2px 0px 5px 3px #443f38;
}

@media screen and (max-width: $tablet) {
  .hero-head > nav:not(.sticky) {
    opacity: 0;
    min-height: 0;
    height: 0;
    overflow: hidden;
    transition: min-height 0s linear 0.2s, height 0s 0.2s, background-color 0.2s ease-in-out, opacity 0.2s;
  }
  nav {
    box-shadow: none !important;
  }
}
</style>