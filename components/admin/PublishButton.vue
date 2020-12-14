<template>
  <a class="button is-success" @click="publish">
    <strong>Publish</strong>
  </a>
</template>


<script>
export default {
  name: "PublishButton",
  props: {
    id: String,
    title: String,
    body: Object,
  },
  methods: {
    async publish() {
      const { result, dialog } = await this.$buefy.dialog.confirm({
          message: `Are you sure you want to publish the article "${this.title}"?`,
      });
      if (!result) {
        this.$buefy.toast.open({message: 'Cancelled publish', type: 'is-danger', duration: 3000});
        return;
      }

      await this.$axios
        .$post(`/api/admin/draft/publish/${this.id}`, this.body)
        .then(slug => {
          this.$emit("redirect");
          this.$router.push(`/article/${slug}`);
        })
        .catch(e => this.$buefy.toast.open({message: 'There was an error', type: 'is-danger', duration: 3000}));
    }
  },
}
</script>