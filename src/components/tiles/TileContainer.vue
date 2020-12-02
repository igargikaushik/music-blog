<template>
  <section class="section">
    <div class="container">
      <div class="tile is-ancestor is-vertical">
        <div v-for="(_, i) in Math.ceil(tiles.length / 3)" :key="i" class="tile is-ancestor">
          <div v-for="(_, j) in 3" :key="j" class="tile is-parent">
            <Tile v-if="3*i + j < tiles.length" v-bind="tiles[3*i + j]" />
            <div v-else class="tile is-parent"></div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import Tile from './Tile.vue'

export default {
  name: 'TileContainer',
  components: {
    Tile
  },
  data() {
    return {
      tiles: [
      {
        title: "Beethoven's Hammerklavier Sonata",
        hasImg: true,
        imgSrc: "https://bulma.io/images/placeholders/128x128.png",
        content: "Ludwig van Beethoven's Piano Sonata No. 29 in B♭ major, Op. 106 (known as the Große Sonate für das Hammerklavier, or more simply as the Hammerklavier)"
      },
      {
        title: "Beethoven's Hammerklavier Sonata",
        hasImg: true,
        imgSrc: "https://bulma.io/images/placeholders/128x128.png",
        content: "Ludwig van Beethoven's Piano Sonata No. 29 in B♭ major, Op. 106 (known as the Große Sonate für das Hammerklavier, or more simply as the Hammerklavier)"
      },
      {
        title: "Beethoven's Hammerklavier Sonata",
        hasImg: true,
        imgSrc: "https://bulma.io/images/placeholders/128x128.png",
        content: "Ludwig van Beethoven's Piano Sonata No. 29 in B♭ major, Op. 106 (known as the Große Sonate für das Hammerklavier, or more simply as the Hammerklavier)"
      },
      {
        title: "Beethoven's Hammerklavier Sonata",
        hasImg: true,
        imgSrc: "https://bulma.io/images/placeholders/128x128.png",
        content: "Ludwig van Beethoven's Piano Sonata No. 29 in B♭ major, Op. 106 (known as the Große Sonate für das Hammerklavier, or more simply as the Hammerklavier)"
      }]
    }
  }
}
</script>