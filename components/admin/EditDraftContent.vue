<template>
  <section class="section">
    <div class="columns is-gapless is-fullheight panes">
      <div class="column content-editor">
        <b-input
          custom-class="content-input"
          type="textarea"
          :value="content"
          @input="function(value) { $emit('update:content', value); }"
          spellcheck="true"
          autocapitalize="off"
          autocomplete="off"
          autocorrect="off"
        ></b-input>
      </div>
      <div class="column has-text-left content-preview">
        <ArticleHeader
          preview
          class="header"
          :title="title"
          :author="author"
          :description="description"
        />
        <ArticleContent :content="content" />
        <ShareTags :category="category" :tags="tags" />
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'EditDraftContent',
  props: {
    title: String,
    author: String,
    description: String,
    content: String,
    tags: Array,
    category: String,
  },
};
</script>

<style lang="scss">
.content-input,
.content-input:hover,
.content-input:active,
.content-input:focus {
  border: 0;
  outline: 0;
  resize: none;
  box-shadow: none;
  -webkit-box-shadow: none;
  height: 100%;
  max-height: unset !important;
}
</style>

<style scoped lang="scss">
.section {
  padding: 0;
}

.header {
  margin-top: 0;
}

.content-preview {
  margin-top: 16px;
}

.panes {
  min-height: calc(100vh - 68px * 2);
  padding: 0 8px;
}

.content-editor {
  min-height: calc(100vh - 68px * 2);
  display: flex;
  flex-flow: column;
  border-right: 2px solid #f5f5f5;
}

.control,
.content {
  height: 100%;
}

.md-body {
  margin: 8px;
  margin-bottom: 1.5rem;
  height: auto;
}
</style>