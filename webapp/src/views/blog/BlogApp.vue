<script setup lang="ts">
import BlogContain from "../../components/blog/BlogContain.vue";
import LandingFooter from "../../components/landing/LandingFooter.vue";
import LandingHeader from "../../components/landing/LandingHeader.vue";
import LandingLayout from "../../layouts/LandingLayout.vue";
</script>
<template>
  <LandingLayout>
    <LandingHeader />
    <BlogContain />
    <LandingFooter />
  </LandingLayout>
</template>

<style scoped></style>
