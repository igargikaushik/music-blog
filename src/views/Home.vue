<template>
  <div class="home">
    <NavBar />
    <Hero />
    <TileContainer />
  </div>
</template>

<script>
import NavBar from '@/components/header/NavBar.vue'
import Hero from '@/components/header/Hero.vue'
import TileContainer from '@/components/tiles/TileContainer.vue'

export default {
  name: 'Home',
  components: {
    NavBar,
    Hero,
    TileContainer,
  }
}
</script>

<style scoped lang="scss">
@import "~bulma/sass/utilities/_all";

nav {
  height: auto;
  background-color: transparent !important;
  opacity: 1.0;
  transition: height 0s 0.2s, background-color 0.2s ease-in-out, box-shadow 0.2s;
}

nav.sticky {
  background-color: #504A41 !important;
}

@media screen and (max-width: $tablet) {
  nav:not(.sticky) {
    opacity: 0;
    min-height: 0;
    height: 0;
    overflow: hidden;
    transition: min-height 0s linear 0.2s, height 0s 0.2s, background-color 0.2s ease-in-out, opacity 0.2s;
  }
}
</style>