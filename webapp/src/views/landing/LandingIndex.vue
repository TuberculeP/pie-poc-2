<template>
  <LandingHeader />
  <LandingContain />
  <LandingFooter />
</template>

<script>
import LandingContain from '../../components/landing/LandingContain.vue'
import LandingHeader from '../../components/landing/LandingHeader.vue'
import LandingFooter from '../../components/landing/LandingFooter.vue';

export default {
  name: 'Index',
  components: {
    LandingContain,
    LandingHeader,
    LandingFooter
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  color: #2c3e50;
}
*{
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body{
  background: linear-gradient(to bottom, #060B17, #040d1a);
}
</style>