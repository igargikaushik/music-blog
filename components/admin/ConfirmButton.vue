<template>
  <b-dropdown-item
    aria-role="listitem"
    @click="confirm(verb, kind, title)">
    {{ text }}
  </b-dropdown-item>
</template>

<script>
export default {
  name: 'ConfirmButton',
  props: {
    verb: String,
    kind: String,
    title: String,
    text: String,
  },
  methods: {
    confirm(verb, kind, title) {
      this.$buefy.dialog.confirm({
        type: 'is-danger',
        hasIcon: true,
        message: `Are you sure you want to ${verb} the ${kind} "${title}"?`,
        onConfirm: () => this.$emit('confirm'),
        onCancel: () => this.$buefy.toast.open({message: `Canceled ${verb}`, type: 'is-danger', duration: 3000}),
      });
    },
  },
};
</script>