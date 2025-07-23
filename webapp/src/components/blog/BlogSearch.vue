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
          <span v-if="!isSearching">🔍</span>
          Rechercher
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
.search-container {
  background-color: var(--color-bg-primary-dark);
  border: 1px solid var(--color-border-secondary);
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
}

.search-container:hover {
  border-color: var(--color-border-secondary-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.search-header {
  margin-bottom: 16px;
  text-align: center;
}

.search-header h3 {
  color: var(--color-white);
  margin: 0 0 4px 0;
  font-size: 1.2rem;
  font-weight: 600;
}

.search-subtitle {
  color: var(--color-secondary);
  margin: 0;
  font-size: 0.85rem;
  opacity: 0.8;
}

.search-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.search-input-group {
  display: flex;
  gap: 8px;
  align-items: stretch;
}

.search-input {
  flex: 1;
  padding: 10px 14px;
  background-color: var(--color-bg-secondary-dark);
  border: 1px solid var(--color-black);
  border-radius: 8px;
  color: var(--color-white);
  font-family: var(--font-body);
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.search-input::placeholder {
  color: var(--color-secondary);
  opacity: 0.7;
}

.search-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(79, 112, 155, 0.1);
  background-color: var(--color-bg-primary-dark);
}

.search-input:hover:not(:focus) {
  border-color: var(--color-border-secondary);
}

.search-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.search-button {
  white-space: nowrap;
  min-width: 100px;
}

.search-tips {
  text-align: center;
  padding-top: 8px;
  border-top: 1px solid var(--color-border-secondary);
}

.search-tips small {
  color: var(--color-secondary);
  opacity: 0.7;
  font-style: italic;
}

/* Responsive */
@media (max-width: 480px) {
  .search-input-group {
    flex-direction: column;
  }

  .search-button {
    min-width: auto;
  }

  .search-container {
    padding: 16px;
  }
}
</style>
