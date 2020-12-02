<template>
  <section class="hero is-medium">
    <div class="blurred-background"></div>
    <div class="hero-head">
      <NavBar />
    </div>
    <div class="hero-body">
      <div class="container">
        <h1 class="title is-1">Classical for Everyone</h1>
        <h2 class="subtitle is-4">Understand music with listening guides</h2>
      </div>
    </div>
  </section>
</template>

<script>
import NavBar from './NavBar.vue'

export default {
  name: "Hero",
  components: {
    NavBar
  }
};
</script>

<style scoped lang="scss">
@import "~bulma/sass/utilities/_all";
.hero {
  position: relative;
  overflow: hidden;

  h1, h2 {
    color: #fff;
  }

  .blurred-background {
    width: 100%;
    height: 100%;
    position: absolute;
    transform: scale(1.03);
    filter: blur(3px);
    -webkit-filter: blur(3px);
    background: rgba(0, 0, 0, 0.65)
      url("../../assets/751px-Autograph-Manuscript-BWV614.jpg") no-repeat center
      center fixed;
    background-blend-mode: darken;
    -webkit-background-size: cover;
    -moz-background-size: cover;
    -o-background-size: cover;
    background-size: cover;
    background-position: center top;
    background-attachment: scroll;
  }

  @media screen and (max-width: $tablet) {
    .blurred-background {
      filter: blur(2px);
      -webkit-filter: blur(2px);
    }
  }
}
</style>