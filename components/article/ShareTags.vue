<template>
  <div class="columns" id="media-tags">
    <div class="column is-one-third">
      <div class="box">
        <strong class="title is-5">Share:</strong>
        <br />
        <font-awesome-icon
          size="3x"
          :icon="['fab', 'twitter-square']"
          class="has-text-info mr-3"
        />
        <font-awesome-icon
          size="3x"
          :icon="['fab', 'facebook-square']"
          class="has-text-info mr-3"
        />
        <font-awesome-icon
          size="3x"
          :icon="['fab', 'reddit-square']"
          class="has-text-info mr-3"
        />
      </div>
    </div>

    <div class="column">
      <div class="box">
        <div class="field is-grouped is-grouped-multiline">
          <label class="label">Category:</label>
          <Tag category :text="category" />
        </div>
        <div class="field is-grouped is-grouped-multiline">
          <label class="label">Tags:</label>
          <Tag v-for="tag in tags" :key="tag" :text="tag" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ShareTags',
  props: {
    category: String,
    tags: Array,
  },
};
</script>

<style scoped lang="scss">
.label {
  padding-right: 8px;
}

#media-tags {
  .column {
    display: flex;
    align-items: stretch;
    flex-flow: column;
    min-width: 250px;
  }

  .box {
    height: 100%;
    vertical-align: middle;
    padding-bottom: 4px;
  }
}
</style>