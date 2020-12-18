<template>
  <a class="button is-success" @click="publish">Publish</a>
</template>


<script>
export default {
  name: 'PublishButton',
  props: {
    id: String,
    title: String,
    body: Object,
  },
  methods: {
    async publish() {
      const { result } = await this.$buefy.dialog.confirm({
        type: 'is-success',
        message: `Are you sure you want to publish the article "${this.title}"?`,
      });
      if (!result) {
        this.$buefy.toast.open({message: 'Canceled publish', type: 'is-danger', duration: 3000});
        return;
      }

      await this.$axios
        .$post(`/api/admin/drafts/publish/${this.id}`, this.body)
        .then(slug => {
          this.$emit('redirect');
          this.$router.push(`/article/${slug}`);
        })
        .catch((e) => {
          if (e.response?.status === 409) {
            this.$buefy.dialog.alert({
              title: 'Conflict',
              message:
                'There already exists an article with the same slug. Rename this draft or the existing article to resolve the conflict. Aborting.',
              type: 'is-danger',
              hasIcon: true,
              ariaRole: 'alertdialog',
              ariaModal: true,
            });
          } else {
            console.log(e.stack);
            this.$buefy.toast.open({
              message: 'There was an error',
              type: 'is-danger',
              duration: 3000,
            });
          }
        });
    }
  },
};
</script>