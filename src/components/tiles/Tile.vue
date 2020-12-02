<template>
  <div class="tile is-parent">
    <article class="tile is-child box">
      <p class="is-size-5 title has-text-left">
        {{ title }}
      </p>
      <article v-if="imgSrc != null" class="media">
        <figure class="media-left">
          <p class="image is-128x128">
            <img :src="imgSrc" />
          </p>
        </figure>
        <section class="media-content has-text-left">
          {{ content }}
        </section>
      </article>

      <section v-else class="has-text-left">
        {{ content }}
      </section>
    </article>
  </div>
</template>

<script>
export default {
  name: 'Tile',
  props: {
    title: String,
    imgSrc: { type: String, default: null},
    content: String
  }
}
</script>

<style scoped lang="scss">
@import "~bulma/sass/utilities/_all";
@import "~bulma";
@import "~buefy/src/scss/buefy";
</style>
