<template>
  <footer class="footer">
    <div class="content has-text-centered">
        <a href="https://twitter.com/classicalevery1">
          <b-icon icon="twitter" type="is-dark" size="is-medium"></b-icon>
        </a>
      <hr>
      <p>
        <strong class="is-4">Copyright © 2021 Henry Sloan</strong>
      </p>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'Footer'
};
</script>

<style scoped lang="scss">
hr {
  margin: 0.5rem 0;
}

strong {
  color: black;
}
</style>
