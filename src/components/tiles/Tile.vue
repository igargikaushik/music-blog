<template>
  <div class="tile is-parent">
    <article class="tile is-child box">
      <p class="is-size-5 title has-text-left">
        {{ title }}
      </p>

      <article v-if="imgSrc != null" class="media mb-1">
        <figure class="media-left">
          <p class="image is-128x128">
            <img :src="imgSrc" />
          </p>
        </figure>
        <section class="media-content has-text-left">
          {{ content }}
        </section>
      </article>

      <section v-else class="has-text-left mb-1">
        {{ content }}
      </section>

      <div id="tags" class="field is-grouped is-grouped-multiline">
        <div class="control">
          <div class="tags has-addons">
            <a class="tag is-link">Article</a>
          </div>
        </div>
        <div class="control">
          <div class="tags has-addons">
            <a class="tag is-light">Sonata</a>
          </div>
        </div>
        <div class="control">
          <div class="tags has-addons">
            <a class="tag is-light">Classical</a>
          </div>
        </div>
      </div>
    </article>
  </div>
</template>

<script>
export default {
  name: "Tile",
  props: {
    title: String,
    imgSrc: { type: String, default: null },
    content: String,
  },
};
</script>

<style scoped lang="scss">
@import "~bulma/sass/utilities/_all";
@import "~bulma";
@import "~buefy/src/scss/buefy";

.box {
  display: flex;
  flex-direction: column;
  height: 100%;
}

#tags {
  margin-top: auto;
}
</style>
