<template>
  <article class="article-tile column">
    <div class="box">
      <NuxtLink :to="'/article/' + slug" :event="disabled ? '' : 'click'">
      <p class="is-size-5 title has-text-left mb-3">
        {{ title }}
      </p>

      <article v-if="image" class="media mb-1">
        <figure class="media-left">
          <p class="image is-128x128">
            <img :src="image" :alt="alt" />
          </p>
        </figure>
        <section class="media-content has-text-left">
          {{ description }}
        </section>
      </article>

      <section v-else class="has-text-left mb-1">
        {{ description }}
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
  name: 'Tile',
  props: {
    title: String,
    slug: String,
    image: { type: String, default: null },
    description: String,
    category: String,
    tags: Array,
    disabled: Boolean,
    alt: String,
  },
};
</script>

<style lang="scss">
@import "~bulma/sass/utilities/initial-variables";

@media screen and (min-width: $tablet) {
  .article-tile .title {
    font-size: 1.1em !important;
    margin: 0;
  }
}
</style>

<style scoped lang="scss">
.box {
  display: flex;
  flex-direction: column;
  height: 100%;
}

a {
  color: inherit;
  display: flex;
  flex-direction: column;
  flex-grow: 1;

  section {
    flex-grow: 1;
  }
} 

.image {
  overflow: hidden;
}

#tags {
  padding-top: 4px;
  margin-top: auto; // 4px;
}
</style>
