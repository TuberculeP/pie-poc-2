<script setup lang="ts">
import { ref, onMounted } from "vue";
import BlogPost from "./BlogPost.vue";
import { getAllPosts, type Post } from "../../services/posts";

const posts = ref<Post[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

const fetchPosts = async () => {
  try {
    loading.value = true;
    error.value = null;
    const result = await getAllPosts();
    const postsArray = Array.isArray(result) ? result : [];

    // Trier les posts : is_highlight en premier, puis par date
    posts.value = postsArray.sort((a, b) => {
      // D'abord trier par is_highlight (true en premier)
      if (a.is_highlight && !b.is_highlight) return -1;
      if (!a.is_highlight && b.is_highlight) return 1;

      // Si même statut highlight, trier par date (plus récent en premier)
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });
  } catch (err) {
    error.value = "Erreur lors du chargement des posts";
    console.error("Erreur:", err);
    posts.value = []; // S'assurer que posts est toujours un tableau
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchPosts();
});
</script>
<template>
  <div class="posts-container">
    <div v-if="loading" class="loading">Chargement des posts...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else>
      <BlogPost
        v-for="post in posts"
        :key="post.id"
        :post="post"
        @refresh="fetchPosts"
      />
      <div v-if="posts && posts.length === 0" class="no-posts">
        Aucun post disponible
      </div>
    </div>
  </div>
</template>
<style scoped>
.loading,
.error,
.no-posts {
  text-align: center;
  padding: 20px;
  color: var(--color-secondary);
}

.error {
  color: var(--color-error);
}
</style>
