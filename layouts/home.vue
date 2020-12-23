<template>
  <div id="home-container">
    <Nuxt />
    <Footer />
  </div>
</template>

<script>
export default {
  name: 'home',
};
</script>

<style scoped lang="scss">
#home-container {
  min-height: calc(100vh - 68px);
  display: flex;
  flex-direction: column;
}
</style>