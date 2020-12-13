<template>
</template>

<script>
export default {
  async middleware(context) {
    const article_id = context.route.params.id;
    const draft_id = await context.$axios
      .$get(`/api/admin/draft/article/${article_id}`)
      .then(draft => draft.id)
      .catch((e) => console.log(e.stack));
    if (draft_id) {
      return context.redirect(`/admin/draft/${draft_id}`);
    }
  }
}
</script>