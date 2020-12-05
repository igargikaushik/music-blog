<template>
  <footer class="footer">
    <div class="content container has-text-center">
      <div class="columns">
        <div class="column"></div>
        <div class="column is-three-quarters">
          <strong class="is-4">© 2020 Henry Sloan</strong>
        </div>
        <div class="column"></div>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'Footer'
}
</script>

<style scoped lang="scss">
@import "~bulma/sass/utilities/_all";
@import "~bulma";
@import "~buefy/src/scss/buefy";

strong {
  color: black;
}
</style>
