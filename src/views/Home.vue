<template>
  <div class="home">
    <Hero />
    <TileContainer />
    <Footer />
  </div>
</template>

<script>
import Hero from '@/components/header/Hero.vue'
import TileContainer from '@/components/tiles/TileContainer.vue'
import Footer from '@/components/Footer.vue'

export default {
  name: 'Home',
  components: {
    Hero,
    TileContainer,
    Footer,
  }
}
</script>