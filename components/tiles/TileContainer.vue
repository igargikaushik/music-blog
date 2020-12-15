<template>
  <section class="section">
    <div class="container">
      <div class="columns is-multiline">
        <Tile v-for="(tile, i) in tiles" :key="i" v-bind="tile" class="is-half-tablet is-half-desktop is-one-third-widescreen" />
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
          slug: "what-sonata",
          imgSrc: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Wolfgang-amadeus-mozart_1.jpg/256px-Wolfgang-amadeus-mozart_1.jpg",
          content: "Many of the most popular classical works are \"Sonatas\". Let's look at what that means, and how we can navigate this vast genre.",
          category: "Article",
          tags: ["Sonata", "Classical", "Romantic", "Baroque"],
        },
        {
          title: "Beethoven's Moonlight Sonata",
          slug: "beethoven-moonlight-sonata",
          imgSrc: "/static_files/6b9de9d8a0092d952602a6faa452e3c32e2a87c0.jpg",
          content: "This work is one of classical music's most famous masterpieces. In fact, it's two of them!",
          category: "Listening Guide",
          tags: ["Sonata", "Classical"],
        },
        {
          title: "Bach's Prelude in C, Well Tempered Clavier",
          slug: "bach-prelude-c-wtc-I",
          imgSrc: "https://upload.wikimedia.org/wikipedia/commons/6/6a/Johann_Sebastian_Bach.jpg",
          content: "Simplicity is bliss; This famous piece opens the \"Old Testament\" of piano repertoire, yet you could probably learn it in an hour!",
          category: "Listening Guide",
          tags: ["Sonata", "Classical"],
        },
        {
          title: "Beethoven's Hammerklavier Sonata",
          slug: "beethoven-hammerklavier-sonata",
          content: "Ludwig van Beethoven's Piano Sonata No. 29 in B♭ major, Op. 106 (known as the Große Sonate für das Hammerklavier, or more simply as the Hammerklavier)",
          category: "Listening Guide",
          tags: ["Sonata", "Classical"],
        }
      ],
    }
  },
  async fetch() {
    await Promise.all(this.tiles.map(async tile => {
      if (tile.imgSrc) {
        await this.$axios
          .$get(`/api/storage/alt?file=${tile.imgSrc}`)
          .then(res => tile.alt = `${res.alt}`)
          .catch((e) => {})
      }
    }));
  }
}
</script>

<style scoped lang="scss">
@import "~bulma/sass/utilities/initial-variables";

@media screen and (max-width: $tablet) {
  .section {
    padding-top: 12px;
    padding-bottom: 8px;
  }
}
</style>

