<template>
  <div class="field is-horizontal">
    <div class="field-label is-normal">
      <label class="label">{{ label }}</label>
    </div>
    <div class="field-body">
      <div class="field">
        <p class="control">
          <input class="input" :value="value" v-on:input="$emit('input', $event.target.value)" />
        </p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ArticleMetaInput",
  props: {
    label: String,
    value: String,
  }
}
</script>

