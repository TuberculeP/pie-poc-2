<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../../stores/authStore";
import { getAllPosts, updatePost, deletePost } from "../../services/posts";
import BlogPost from "../../components/blog/BlogPost.vue";
import BaseButton from "../../components/ui/BaseButton.vue";
import type { Post } from "../../lib/utils/types";

const router = useRouter();
const authStore = useAuthStore();

const userPosts = ref<Post[]>([]);
const isLoading = ref(true);
const error = ref<string | null>(null);
const editingPost = ref<Post | null>(null);
const editForm = ref({
  body: "",
});

// États de l'utilisateur
const user = computed(() => authStore.user);
const isAuthenticated = computed(() => authStore.isAuthenticated);

// Statistiques utilisateur
const userStats = computed(() => {
  const posts = userPosts.value;
  const totalPosts = posts.length;
  const highlightPosts = posts.filter((p: Post) => p.is_highlight).length;
  const totalComments = posts.reduce(
    (sum: number, post: Post) => sum + (post.comments?.length || 0),
    0,
  );

  return {
    totalPosts,
    highlightPosts,
    totalComments,
  };
});

// Charger les posts de l'utilisateur
const loadUserPosts = async () => {
  if (!user.value) {
    router.push("/login");
    return;
  }

  try {
    isLoading.value = true;
    error.value = null;

    const allPosts = await getAllPosts();
    // Filtrer les posts de l'utilisateur connecté avec vérification défensive
    userPosts.value = allPosts
      .filter(
        (post) =>
          post.author &&
          post.author.id &&
          user.value?.id &&
          post.author.id === user.value.id,
      )
      .sort(
        (a, b) =>
          new Date(b.createdAt || "").getTime() -
          new Date(a.createdAt || "").getTime(),
      );
  } catch (err) {
    console.error("Erreur lors du chargement des posts:", err);
    error.value = "Erreur lors du chargement de vos posts";
  } finally {
    isLoading.value = false;
  }
};

// Commencer l'édition d'un post
const startEdit = (post: Post) => {
  editingPost.value = post;
  editForm.value = {
    body: post.body,
  };
};

// Annuler l'édition
const cancelEdit = () => {
  editingPost.value = null;
  editForm.value = {
    body: "",
  };
};

// Sauvegarder les modifications
const saveEdit = async () => {
  if (!editingPost.value?.id) return;

  try {
    await updatePost(editingPost.value.id.toString(), {
      body: editForm.value.body,
    });

    // Mettre à jour le post dans la liste locale
    const index = userPosts.value.findIndex(
      (p: Post) => p.id === editingPost.value?.id,
    );
    if (index !== -1) {
      userPosts.value[index] = {
        ...userPosts.value[index],
        body: editForm.value.body,
      };
    }

    cancelEdit();
  } catch (err) {
    console.error("Erreur lors de la modification:", err);
    error.value = "Erreur lors de la modification du post";
  }
};

// Supprimer un post
const handleDeletePost = async (postId: number) => {
  if (!confirm("Êtes-vous sûr de vouloir supprimer ce post ?")) return;

  try {
    await deletePost(postId);
    userPosts.value = userPosts.value.filter((p: Post) => p.id !== postId);
  } catch (err) {
    console.error("Erreur lors de la suppression:", err);
    error.value = "Erreur lors de la suppression du post";
  }
};

// Formater la date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

onMounted(() => {
  if (!isAuthenticated.value) {
    router.push("/login");
    return;
  }
  loadUserPosts();
});
</script>

<template>
  <div class="profile-container">
    <!-- En-tête du profil -->
    <div class="profile-header">
      <div class="profile-info">
        <div class="profile-avatar-large">
          {{ user?.firstName?.charAt(0) }}{{ user?.lastName?.charAt(0) }}
        </div>
        <div class="profile-details">
          <h1 class="profile-name">
            {{ user?.firstName }} {{ user?.lastName }}
          </h1>
          <p class="profile-email">{{ user?.email }}</p>
          <p class="profile-joined">
            Membre depuis {{ formatDate(user?.createdAt?.toString() || "") }}
          </p>
        </div>
      </div>

      <div class="profile-actions">
        <BaseButton
          variant="primary"
          size="small"
          @click="router.push('/messages')"
        >
          <i class="fas fa-envelope"></i> Mes Messages
        </BaseButton>
        <BaseButton variant="ghost" size="small" @click="router.push('/blog')">
          ← Retour au blog
        </BaseButton>
      </div>
    </div>

    <!-- Statistiques -->
    <div class="profile-stats">
      <div class="stat-item">
        <span class="stat-number">{{ userStats.totalPosts }}</span>
        <span class="stat-label">Posts</span>
      </div>
      <div class="stat-item">
        <span class="stat-number">{{ userStats.highlightPosts }}</span>
        <span class="stat-label">Highlights</span>
      </div>
      <div class="stat-item">
        <span class="stat-number">{{ userStats.totalComments }}</span>
        <span class="stat-label">Commentaires reçus</span>
      </div>
    </div>

    <!-- Messages d'état -->
    <div v-if="error" class="error-message">
      {{ error }}
      <BaseButton variant="ghost" size="small" @click="loadUserPosts">
        Réessayer
      </BaseButton>
    </div>

    <!-- Chargement -->
    <div v-if="isLoading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Chargement de vos posts...</p>
    </div>

    <!-- Posts de l'utilisateur -->
    <div v-else class="profile-posts">
      <h2 class="posts-title">Mes Posts</h2>

      <!-- Aucun post -->
      <div v-if="userPosts.length === 0" class="empty-posts">
        <div class="empty-icon">📝</div>
        <h3>Aucun post pour le moment</h3>
        <p>Commencez à partager vos idées !</p>
        <BaseButton variant="primary" @click="router.push('/blog')">
          Créer mon premier post
        </BaseButton>
      </div>

      <!-- Liste des posts -->
      <div v-else class="posts-list">
        <div v-for="post in userPosts" :key="post.id" class="post-item">
          <!-- Mode d'édition -->
          <div v-if="editingPost?.id === post.id" class="edit-mode">
            <div class="edit-form">
              <textarea
                v-model="editForm.body"
                class="edit-textarea"
                placeholder="Contenu du post..."
                rows="4"
              ></textarea>

              <div class="edit-actions">
                <BaseButton
                  variant="primary"
                  size="small"
                  @click="saveEdit"
                  :disabled="!editForm.body.trim()"
                >
                  Sauvegarder
                </BaseButton>
                <BaseButton variant="ghost" size="small" @click="cancelEdit">
                  Annuler
                </BaseButton>
              </div>
            </div>
          </div>

          <!-- Mode d'affichage -->
          <div v-else class="post-display">
            <BlogPost :post="post" />

            <div class="post-actions">
              <BaseButton variant="ghost" size="small" @click="startEdit(post)">
                <i class="fas fa-pencil-alt"></i>
                <span>Modifier</span>
              </BaseButton>
              <BaseButton
                variant="ghost"
                size="small"
                color="danger"
                @click="handleDeletePost(post.id!)"
              >
                <i class="fas fa-trash-alt"></i>
                <span> Supprimer </span>
              </BaseButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 1rem;
  padding-top: 120px; /* Pour compenser le header fixe */
}

/* En-tête du profil */
.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 2px solid var(--color-border-secondary);
}

.profile-info {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.profile-avatar-large {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: var(--color-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-black);
}

.profile-details {
  flex: 1;
}

.profile-actions {
  display: flex;
  gap: 0.5rem;
}

.profile-name {
  font-family: var(--font-heading);
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 0.5rem 0;
}

.profile-email {
  color: var(--color-text-secondary);
  font-size: 1.1rem;
  margin: 0 0 0.25rem 0;
}

.profile-joined {
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  margin: 0;
}

/* Statistiques */
.profile-stats {
  display: flex;
  justify-content: center;
  gap: 3rem;
  margin-bottom: 3rem;
  padding: 2rem;
  background: var(--color-background-secondary);
  border-radius: 12px;
  border: 1px solid var(--color-border-secondary);
}

.stat-item {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--color-accent);
  margin-bottom: 0.5rem;
}

.stat-label {
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  font-weight: 500;
}

/* États */
.loading-state {
  text-align: center;
  padding: 3rem 1rem;
}

.loading-spinner {
  width: 2rem;
  height: 2rem;
  border: 3px solid var(--color-border-secondary);
  border-top: 3px solid var(--color-accent);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.error-message {
  background: #fee;
  border: 1px solid #fcc;
  color: #c33;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  text-align: center;
}

.empty-posts {
  text-align: center;
  padding: 3rem 1rem;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-posts h3 {
  font-family: var(--font-heading);
  font-size: 1.5rem;
  color: var(--color-text-primary);
  margin: 0 0 1rem 0;
}

.empty-posts p {
  color: var(--color-text-secondary);
  margin: 0 0 2rem 0;
}

/* Posts */
.posts-title {
  font-family: var(--font-heading);
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 2rem 0;
}

.posts-list {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.post-item {
  overflow: hidden;
}

.post-display {
  position: relative;
}

.post-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;

  span {
    margin-left: 0.25rem;
  }
}

/* Mode d'édition */
.edit-mode {
  padding: 1.5rem;
}

.edit-textarea {
  width: 100%;
  padding: 1rem;
  border: 1px solid var(--color-border-secondary);
  border-radius: 8px;
  font-family: var(--font-body);
  font-size: 1rem;
  line-height: 1.5;
  resize: vertical;
  margin-bottom: 1rem;
}

.edit-textarea:focus {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px rgba(var(--color-accent-rgb), 0.1);
}

.edit-options {
  margin-bottom: 1rem;
}

.edit-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

/* Responsive */
@media (max-width: 768px) {
  .profile-container {
    padding: 1rem 0.75rem;
    padding-top: 100px;
  }

  .profile-header {
    flex-direction: column;
    gap: 1.5rem;
  }

  .profile-info {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }

  .profile-avatar-large {
    width: 60px;
    height: 60px;
    font-size: 1.5rem;
  }

  .profile-name {
    font-size: 1.5rem;
  }

  .profile-stats {
    gap: 1.5rem;
    padding: 1.5rem;
  }

  .stat-number {
    font-size: 2rem;
  }

  .post-actions {
    flex-direction: column;
  }
}
</style>
