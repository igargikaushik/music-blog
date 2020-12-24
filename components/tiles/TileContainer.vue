<template>
  <section class="section">
    <div class="container">
      <div class="columns is-multiline">
        <Tile v-for="(tile, i) in articles" :key="i" v-bind="tile" class="is-half-tablet is-half-desktop is-one-third-widescreen" />
      </div>
    </div>
  </section>
</template>

<script>
import Tile from './Tile.vue';

export default {
  name: 'TileContainer',
  components: {
    Tile,
  },
  props: {
    articles: Array,
  },
};
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

