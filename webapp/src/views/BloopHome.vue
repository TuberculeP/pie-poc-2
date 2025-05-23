<script setup lang="ts">
import { useI18n } from "vue-i18n";

const { t } = useI18n();
</script>

<template>
  <div>
    <h1>{{ t("app.title") }}</h1>
  </div>
  <div>
    <RouterLink :to="{ name: 'app-main' }">Accéder à l'application</RouterLink>
  </div>
</template>
