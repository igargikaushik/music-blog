<template>
  <div class="control">
    <div class="tags has-addons">
      <a :class="['tag', color_class]">{{ text }}</a>
    </div>
  </div>
</template>

<script>
const category_colors = {
  "Article": "is-link",
  "Listening Guide": "is-success",
};

export default {
  name: "Tag",
  props: {
    category: Boolean,
    text: String,
  },
  computed: {
    color_class() {
      return this.category ? (category_colors[this.text] || "is-dark") : "is-light";
    },
  },
};
</script>