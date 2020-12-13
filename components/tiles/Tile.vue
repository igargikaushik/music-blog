<template>
    <article class="article-tile column">
      <div class="box">
        <NuxtLink :to="'/article/' + slug" :event="disabled ? '' : 'click'">
        <p class="is-size-5 title has-text-left mb-3">
          {{ title }}
        </p>

        <article v-if="imgSrc != null" class="media mb-1">
          <figure class="media-left">
            <p class="image is-128x128">
              <img :src="imgSrc" :alt="alt" />
            </p>
          </figure>
          <section class="media-content has-text-left">
            {{ content }}
          </section>
        </article>

        <section v-else class="has-text-left mb-1">
          {{ content }}
        </section>
        </NuxtLink>

        <hr class="my-1" />
        <div id="tags" class="field is-grouped is-grouped-multiline">
          <Tag category :text="category" class="mb-1" />
          <Tag v-for="tag in tags" :key="tag" :text="tag" class="mb-1" />
        </div>
      </div>
    </article>
</template>

<script>
export default {
  name: "Tile",
  props: {
    title: String,
    slug: String,
    imgSrc: { type: String, default: null },
    content: String,
    category: String,
    tags: Array,
    disabled: Boolean,
    alt: String,
  },
};
</script>

<style scoped lang="scss">
@import "~bulma/sass/utilities/initial-variables";

.box {
  display: flex;
  flex-direction: column;
  height: 100%;
}

a { color: inherit; } 

.image {
  overflow: hidden;
}

#tags {
  padding-top: 4px;
  margin-top: auto; // 4px;
}

@media screen and (min-width: $tablet) {
  .title {
    font-size: 1.1em !important;
    margin: 0;
  }
}
</style>
