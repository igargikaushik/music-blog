<template>
  <div>
    <NavBar />
    <Nuxt />
  </div>
</template>

<script>
export default {
  middleware: ['admin_auth'],
};
</script>