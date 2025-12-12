<template>
  <div class="button-showcase">
    <h2>Composant Button - Démonstration</h2>

    <!-- Tailles -->
    <section class="showcase-section">
      <h3>Tailles</h3>
      <div class="buttons-row">
        <BaseButton size="small" @click="handleClick">Petit</BaseButton>
        <BaseButton size="normal" @click="handleClick">Normal</BaseButton>
        <BaseButton size="large" @click="handleClick">Grand</BaseButton>
      </div>
    </section>

    <!-- Variantes -->
    <section class="showcase-section">
      <h3>Variantes</h3>
      <div class="buttons-row">
        <BaseButton variant="primary" @click="handleClick">Primary</BaseButton>
        <BaseButton variant="secondary" @click="handleClick"
          >Secondary</BaseButton
        >
        <BaseButton variant="accent" @click="handleClick">Accent</BaseButton>
        <BaseButton variant="error" @click="handleClick">Error</BaseButton>
        <BaseButton variant="link" @click="handleClick">Link</BaseButton>
        <BaseButton variant="ghost" @click="handleClick">Ghost</BaseButton>
      </div>
    </section>

    <!-- États -->
    <section class="showcase-section">
      <h3>États</h3>
      <div class="buttons-row">
        <BaseButton @click="handleClick">Normal</BaseButton>
        <BaseButton disabled @click="handleClick">Disabled</BaseButton>
        <BaseButton loading @click="handleClick">Loading</BaseButton>
      </div>
    </section>

    <!-- Combinaisons -->
    <section class="showcase-section">
      <h3>Combinaisons</h3>
      <div class="buttons-row">
        <BaseButton variant="primary" size="small" @click="handleClick"
          >Primary Small</BaseButton
        >
        <BaseButton variant="secondary" size="large" @click="handleClick"
          >Secondary Large</BaseButton
        >
        <BaseButton variant="accent" size="normal" @click="handleClick"
          >Accent Normal</BaseButton
        >
        <BaseButton variant="ghost" size="normal" @click="handleClick"
          >Accent Normal</BaseButton
        >
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import BaseButton from "./BaseButton.vue";

const handleClick = (event: MouseEvent) => {
  console.log("Button clicked!", event);
};
</script>

<style scoped>
.button-showcase {
  padding: 20px;
  color: var(--color-white);
}

.showcase-section {
  margin-bottom: 32px;
}

.showcase-section h3 {
  color: var(--color-accent);
  margin-bottom: 16px;
}

.buttons-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}
</style>
