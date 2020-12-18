<template>
  <div class="columns has-text-centered">
    <div class="column"></div>
    <div :class="['column', preview ? 'is-four-fifths' : 'is-two-fifths']">
      <p class="title">{{ title }}</p>
      <p class="subtitle mb-2">by {{ author }}</p>
      <i>{{ description }}</i>
    </div>
    <div class="column"></div>
  </div>
</template>

<script>
export default {
  name: 'ArticleHeader',
  props: {
    title: String,
    author: String,
    description: String,
    preview: Boolean,
  }
};
</script>
