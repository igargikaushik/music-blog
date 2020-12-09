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
  },
}
</script>

<style scoped lang="scss">
.home {
  margin-top: -68px;
}

nav.sticky {
  background-color: #504A41 !important;
}

body {
  padding-top: 0 !important;
}
</style>