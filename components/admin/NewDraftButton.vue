<template>
  <b-button type="is-success" icon-left="plus" @click="click_new">New</b-button>
</template>

<script>
export default {
  name: "NewDraftButton",
  methods: {
    click_new() {
      this.$buefy.dialog.confirm({
        message: "Are you sure you want to make a new draft?",
        type: "is-success",
        onConfirm: () => this.new_draft(),
      });
    },
    async new_draft() {
      const new_id = await this.$axios
        .$post("/api/admin/draft")
        .then((draft) => draft.id)
        .catch((e) => console.log(e.stack));
      this.$router.push(`/admin/draft/${new_id}`);
    },
  },
};
</script>