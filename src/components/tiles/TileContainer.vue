<template>
  <section class="section">
    <div class="container">
      <div class="columns is-multiline">
        <Tile v-for="(tile, i) in tiles" :key="i" v-bind="tile" class="is-one-third-widescreen is-half-desktop is-half-tablet" />
      </div>
    </div>
  </section>
</template>

<script>
import Tile from './Tile.vue'

export default {
  name: 'TileContainer',
  components: {
    Tile,
  },
  data() {
    return {
      tiles: [
      {
        title: "What is a Sonata?",
        imgSrc: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Wolfgang-amadeus-mozart_1.jpg/256px-Wolfgang-amadeus-mozart_1.jpg",
        content: "Many of the most popular classical works are \"Sonatas\". Let's look at what that means, and how we can navigate this vast genre.",
        category: "Article",
        tags: ["Sonata", "Classical", "Romantic", "Baroque"]
      },
      {
        title: "Beethoven's Moonlight Sonata",
        imgSrc: "https://snappygoat.com/b/6b9de9d8a0092d952602a6faa452e3c32e2a87c0",
        content: "This work is one of classical music's most famous masterpieces. In fact, it's two of them!",
        category: "Listening Guide",
        tags: ["Sonata", "Classical"]
      },
      {
        title: "Bach's Prelude in C, Well Tempered Clavier",
        hasImg: true,
        imgSrc: "https://upload.wikimedia.org/wikipedia/commons/6/6a/Johann_Sebastian_Bach.jpg",
        content: "Simplicity is bliss; This famous piece opens the \"Old Testiment\" of piano repertoire, yet you could probably learn it is an hour!",
        category: "Listening Guide",
        tags: ["Sonata", "Classical"]

      },
      {
        title: "Beethoven's Hammerklavier Sonata",
        hasImg: true,
        imgSrc: "https://bulma.io/images/placeholders/128x128.png",
        content: "Ludwig van Beethoven's Piano Sonata No. 29 in B♭ major, Op. 106 (known as the Große Sonate für das Hammerklavier, or more simply as the Hammerklavier)",
        category: "Listening Guide",
        tags: ["Sonata", "Classical"]

      }]
    }
  }
}
</script>

<style scoped lang="scss">
@import "~bulma/sass/utilities/_all";
@import "~bulma";
@import "~buefy/src/scss/buefy";

@media screen and (max-width: $tablet) {
  .section {
    padding-top: 12px;
    padding-bottom: 8px;
  }
}
</style>

