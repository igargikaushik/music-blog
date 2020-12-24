<template>
  <b-navbar :mobile-burger="false" :class="[{sticky: scroll > 40}, {'on-home': $nuxt.$route.path == '/'}, 'is-fixed-top']">
    <template slot="brand">
      <b-navbar-item tag="NuxtLink" :to="{ path: '/' }">
        <img
          id="navbar-logo"
          src="/icon.png"
          alt="Classical for Everyone Icon"
        >
      </b-navbar-item>
    </template>
  </b-navbar>
</template>

<script>
export default {
  name: 'NavBar',
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

<style lang="scss">
@import "~bulma/sass/utilities/initial-variables";

@media screen and (max-width: $tablet) {
  nav.on-home:not(.sticky) {
    opacity: 0;
    min-height: 0;
    height: 0;
    overflow: hidden;
    transition: min-height 0s linear 0.2s, height 0s 0.2s, background-color 0.2s ease-in-out, opacity 0.2s;
  }
}

nav.on-home {
  height: 68px;
  min-height: 68px;
  background-color: transparent !important;
  opacity: 1.0;
  transition: height 0s 0.2s, background-color 0.2s ease-in-out, box-shadow 0.2s;
}
</style>

<style scoped lang="scss">
nav {
  background-color: #504A41;
  height: 68px;
}

.navbar-item {
  padding: 0.7rem 0.7rem;
  margin: 0.3rem 0.8rem;
  background: white !important;
  border-radius: 50%;

  img {
    width: 36px;
    height: 36px;
    max-height: unset;
  }
}
</style>