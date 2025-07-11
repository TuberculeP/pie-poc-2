<template>
  <LandingLayout
    ><LandingHeader />
    <LandingContain />
    <LandingFooter
  /></LandingLayout>
</template>

<script setup lang="ts">
import LandingContain from "../../components/landing/LandingContain.vue";
import LandingHeader from "../../components/landing/LandingHeader.vue";
import LandingFooter from "../../components/landing/LandingFooter.vue";
import LandingLayout from "../../layouts/LandingLayout.vue";
</script>

<style></style>
