<template>
  <div id="default-container">
    <NavBar />
    <Nuxt />
    <Footer />
  </div>
</template>

<script>
export default {
  name: 'default',
};
</script>

<style scoped lang="scss">
#default-container {
  min-height: calc(100vh - 68px);
  display: flex;
  flex-direction: column;
}
</style>