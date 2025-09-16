<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import BaseButton from "../ui/BaseButton.vue";

const router = useRouter();
const searchQuery = ref("");
const isSearching = ref(false);

const handleSearch = async () => {
  if (!searchQuery.value.trim()) return;

  try {
    isSearching.value = true;

    // Rediriger vers la page de résultats avec la query en paramètre
    await router.push({
      name: "blog-search-results",
      query: { q: searchQuery.value.trim() },
    });
  } catch (error) {
    console.error("Erreur lors de la recherche:", error);
  } finally {
    isSearching.value = false;
  }
};

const handleKeyPress = (event: KeyboardEvent) => {
  if (event.key === "Enter") {
    handleSearch();
  }
};
</script>

<template>
  <div class="search-container">
    <div class="search-header">
      <h2>Rechercher</h2>
      <p class="search-subtitle">Trouvez des posts par contenu</p>
    </div>

    <div class="search-form">
      <div class="search-input-group">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Rechercher dans les posts..."
          class="search-input"
          @keypress="handleKeyPress"
          :disabled="isSearching"
        />
        <BaseButton
          variant="primary"
          size="small"
          @click="handleSearch"
          :loading="isSearching"
          :disabled="!searchQuery.trim() || isSearching"
          class="search-button"
        >
          <span v-if="!isSearching"> <i class="fas fa-search" /></span>
          Rechercher
        </BaseButton>
      </div>
    </div>
  </div>
</template>
