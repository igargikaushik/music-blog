<template>
  <section class="section">
    <div class="columns is-gapless is-fullheight">
      <div class="column"></div>
      <div class="column is-three-fifths">
        <article class="column">
          <div class="box has-text-left">
            <ArticleMetaInput label="Title" :value="title"
              @input="function(value) { $emit('update:title', value); }"
            />
            <ArticleMetaInput label="Author" :value="author"
              @input="function(value) { $emit('update:author', value); }"
            />
            <ArticleMetaInput
              textarea
              label="Description"
              :value="description"
              @input="function(value) { $emit('update:description', value); }"
            />
            <ArticleImageInput :value="image"
              @input="function(value) { $emit('update:image', value); }"
            />
            <ArticleMetaInput label="Category" :value="category"
              @input="function(value) { $emit('update:category', value); }"
            />
            <b-taginput
              :value="tags"
              @input="function(value) { $emit('update:tags', value); }"
              ellipsis
              :remove-on-keys="[]"
              icon="label"
              placeholder="Add a tag"
              aria-close-label="Delete this tag"
            >
            </b-taginput>
          </div>
        </article>
        <Tile disabled v-bind="tile" />
      </div>
      <div class="column"></div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'EditDraftMeta',
  props: {
    title: String,
    author: String,
    description: String,
    tags: Array,
    category: String,
    image: String,
  },
  computed: {
    tile() {
      return {
        title: this.title,
        image: this.image,
        description: this.description,
        category: this.category,
        tags: this.tags,
      };
    },
  },
};
</script>

<style scoped lang="scss">
.article-tile {
  max-width: 29.2em;
}
</style>