<template>
  <div class="content md-body" v-html="$md.render(content)"></div>
</template>

<script>
export default {
  name: 'ArticleContent',
  props: {
    content: String,
  }
};
</script>

<style lang="scss">
// Unscoped styles for markdown
.markdown-toc ol {
  margin: 0;
  padding-left: 16px;
}

.md-body {
  p:empty {
    display: none;
  }

  h1::before, h2::before {
    content: '';
    display: block;
    height:      75px;
    margin-top: -75px;
    visibility: hidden;
  }
}
</style>
