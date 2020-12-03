<template>
    <article class="column">
      <div class="box">
        <p class="is-size-5 title has-text-left mb-3">
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
              <a :class="['tag', category_colors[category] || 'is-dark']">{{ category }}</a>
            </div>
          </div>
          <div class="control" v-for="tag in tags" :key=tag>
            <div class="tags has-addons">
              <a class="tag is-light">{{ tag }}</a>
            </div>
          </div>
        </div>
      </div>
    </article>
</template>

<script>
export default {
  name: "Tile",
  props: {
    title: String,
    imgSrc: { type: String, default: null },
    content: String,
    category: String,
    tags: Array,
  },
  data() {
    return {
      category_colors: {
        "Article": "is-link",
        "Listening Guide": "is-success",
      },
    }
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

.image {
  overflow: hidden;
}

#tags {
  margin-top: 4px;
}

@media screen and (min-width: $tablet) {
  .title {
    font-size: 1.1em !important;
    margin: 0;
  }
}
</style>
