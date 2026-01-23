<template>
  <main class="landing-main-section">
    <LandingHero />
    <LandingFeature />
    <LandingPricing />
    <LandingIncluded />
    <LandingCommunity />
  </main>
</template>

<script>
import LandingIncluded from "./sections/LandingIncluded.vue";
import LandingHero from "./sections/LandingHero.vue";
import LandingFeature from "./sections/LandingFeature.vue";
import LandingPricing from "./sections/LandingPricing.vue";
import LandingCommunity from "./sections/LandingCommunity.vue";

export default {
  name: "HelloWorld",
  components: {
    LandingHero,
    LandingFeature,
    LandingIncluded,
    LandingPricing,
    LandingCommunity,
  },
};
</script>

<style>
.landing-main-section {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: var(--color-white);
  overflow-x: hidden;
}

.landing-main-section > section {
  position: relative;
  min-height: 100vh;
  width: 100%;
  max-width: 1200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 48px;
}

.landing-main-section .section-title {
  text-align: center;
  font-size: clamp(1.8rem, 4vw, 2.6rem);
  font-weight: 600;
}

@media screen and (max-width: 480px) {
  .landing-main-section .section-title {
    font-size: 1.8rem;
  }
}
</style>
