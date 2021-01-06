<template>
  <div class="columns has-text-centered">
    <div class="column"></div>
    <div :class="['column', preview ? 'is-four-fifths' : 'is-two-fifths']">
      <p class="title">
        {{ title }}
        <NuxtLink v-if="!preview && $store.state.user && $store.state.user.admin"
          :to="'/admin/article/' + id">
          <b-icon icon="pencil" custom-size="mdi-8px"></b-icon>
        </NuxtLink>
      </p>
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
    id: Number,
    title: String,
    author: String,
    description: String,
    preview: Boolean,
  }
};
</script>

<style lang="scss">
#article-main .mdi-pencil {
  color: black;
}
</style>