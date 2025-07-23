<script setup lang="ts">
import { defineProps, defineEmits, computed, ref } from "vue";
import {
  deletePost,
  updatePost,
  getAllPosts,
  createPost,
  type Post,
  type CreatePostData,
} from "../../services/posts";
import { useAuthStore } from "../../stores/authStore";
import BaseButton from "../ui/BaseButton.vue";

const props = defineProps<{
  post: Post;
}>();

const emit = defineEmits<{
  refresh: [];
}>();

const authStore = useAuthStore();

// État pour gérer l'affichage des commentaires
const showComments = ref(false);
const comments = ref<Post[]>([]);
const loadingComments = ref(false);
const errorComments = ref<string | null>(null);

// État pour le formulaire de commentaire
const showCommentForm = ref(false);
const commentText = ref("");
const isSubmittingComment = ref(false);
const commentError = ref<string | null>(null);

// État pour le système de like
const isLiked = ref(false);
const likeCount = ref(0);
const isLiking = ref(false);

// Vérifier si l'utilisateur est admin
const isAdmin = computed(() => {
  return authStore.user?.role === "admin";
});

// Fonction pour récupérer les commentaires du post
const fetchComments = async () => {
  if (!props.post.id) return;

  try {
    loadingComments.value = true;
    errorComments.value = null;

    const allPosts = await getAllPosts();
    const postsArray = Array.isArray(allPosts) ? allPosts : [];

    // Filtrer les posts qui sont des commentaires de ce post
    comments.value = postsArray
      .filter((p) => p.comment_of === props.post.id)
      .sort((a, b) => {
        // Trier par date (plus récent en premier)
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA;
      });
  } catch (error) {
    errorComments.value = "Erreur lors du chargement des commentaires";
    console.error("Erreur commentaires:", error);
  } finally {
    loadingComments.value = false;
  }
};

// Fonction pour basculer l'affichage des commentaires
const toggleComments = async () => {
  showComments.value = !showComments.value;

  if (showComments.value && comments.value.length === 0) {
    await fetchComments();
  }
};

// Compter le nombre de commentaires (pour l'affichage)
const commentsCount = computed(() => {
  return comments.value.length;
});

// Fonction pour basculer l'affichage du formulaire de commentaire
const toggleCommentForm = () => {
  showCommentForm.value = !showCommentForm.value;
  if (!showCommentForm.value) {
    commentText.value = "";
    commentError.value = null;
  }
};

// Fonction pour soumettre un commentaire
const submitComment = async () => {
  if (!commentText.value.trim()) {
    commentError.value = "Le commentaire ne peut pas être vide";
    return;
  }

  if (!props.post.id) {
    commentError.value = "Erreur: ID du post manquant";
    return;
  }

  try {
    isSubmittingComment.value = true;
    commentError.value = null;

    const newComment: CreatePostData = {
      body: commentText.value.trim(),
      comment_of: props.post.id,
    };

    await createPost(newComment);

    // Réinitialiser le formulaire
    commentText.value = "";
    showCommentForm.value = false;

    // Recharger les commentaires si ils sont affichés
    if (showComments.value) {
      await fetchComments();
    } else {
      // Sinon, juste mettre à jour le compteur
      const allPosts = await getAllPosts();
      const postsArray = Array.isArray(allPosts) ? allPosts : [];
      comments.value = postsArray.filter((p) => p.comment_of === props.post.id);
    }

    emit("refresh");
  } catch (error) {
    commentError.value = "Erreur lors de l'ajout du commentaire";
    console.error("Erreur commentaire:", error);
  } finally {
    isSubmittingComment.value = false;
  }
};

// Fonction pour gérer les likes
const toggleLike = async () => {
  if (!authStore.isAuthenticated) return;
  if (isLiking.value) return;

  try {
    isLiking.value = true;

    // Animation immédiate pour une meilleure UX
    isLiked.value = !isLiked.value;
    likeCount.value += isLiked.value ? 1 : -1;

    // TODO: Implémenter l'appel API pour les likes
    // Pour l'instant, simulation
    await new Promise((resolve) => setTimeout(resolve, 300));
  } catch (error) {
    // Revenir à l'état précédent en cas d'erreur
    isLiked.value = !isLiked.value;
    likeCount.value += isLiked.value ? 1 : -1;
    console.error("Erreur lors du like:", error);
  } finally {
    isLiking.value = false;
  }
};

const handleDelete = async () => {
  if (
    props.post.id &&
    confirm("Êtes-vous sûr de vouloir supprimer ce post ?")
  ) {
    try {
      await deletePost(props.post.id);
      emit("refresh");
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      alert("Erreur lors de la suppression du post");
    }
  }
};

const toggleHighlight = async () => {
  if (props.post.id) {
    try {
      await updatePost(props.post.id, {
        is_highlight: !props.post.is_highlight,
      });
      emit("refresh");
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      alert("Erreur lors de la mise à jour du post");
    }
  }
};

const formatDate = (dateString?: string) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
</script>
<template>
  <div class="post-container" :class="{ highlighted: post.is_highlight }">
    <div class="post-header">
      <div class="author">
        {{
          post.author
            ? `${post.author.firstName} ${post.author.lastName}` ||
              post.author.email
            : "Auteur inconnu"
        }}
      </div>
      <div class="date">{{ formatDate(post.createdAt) }}</div>

      <!-- Boutons d'administration (visibles seulement pour les admins) -->
      <div v-if="isAdmin" class="admin-controls">
        <button
          @click="toggleHighlight"
          class="highlight-button"
          :class="{ active: post.is_highlight }"
          :title="
            post.is_highlight ? 'Retirer le highlight' : 'Mettre en highlight'
          "
        >
          ★
        </button>
        <button @click="handleDelete" class="delete-button" title="Supprimer">
          ×
        </button>
      </div>
    </div>
    <div class="post-content">
      {{ post.body }}
    </div>
    <div class="post-footer">
      <!-- Bouton Like avec icône de cœur -->
      <button
        class="like-button"
        @click="toggleLike"
        :disabled="!authStore.isAuthenticated || isLiking"
        :title="
          !authStore.isAuthenticated
            ? 'Connectez-vous pour liker'
            : isLiked
              ? 'Retirer le like'
              : 'Liker ce post'
        "
      >
        <div class="heart-icon" :class="{ liked: isLiked, liking: isLiking }">
          ♥
        </div>
        <span class="like-count" v-if="likeCount > 0">{{ likeCount }}</span>
      </button>

      <BaseButton
        variant="ghost"
        size="small"
        @click="toggleComments"
        :loading="loadingComments"
        :title="
          showComments
            ? 'Masquer les commentaires'
            : 'Afficher les commentaires'
        "
      >
        {{ showComments ? "Masquer" : "Voir" }} commentaires ({{
          commentsCount
        }})
      </BaseButton>

      <!-- Bouton pour ajouter un commentaire (uniquement si connecté) -->
      <BaseButton
        v-if="authStore.isAuthenticated"
        variant="ghost"
        size="small"
        @click="toggleCommentForm"
        :title="showCommentForm ? 'Annuler' : 'Ajouter un commentaire'"
        color="accent"
      >
        {{ showCommentForm ? "Annuler" : "Commenter" }}
      </BaseButton>
    </div>

    <!-- Section des commentaires -->
    <div v-if="showComments || showCommentForm" class="comments-section">
      <!-- Formulaire d'ajout de commentaire -->
      <div
        v-if="showCommentForm && authStore.isAuthenticated"
        class="comment-form"
      >
        <div class="comment-form-header">
          <h4>Ajouter un commentaire</h4>
        </div>
        <div class="comment-form-content">
          <textarea
            v-model="commentText"
            placeholder="Écrivez votre commentaire..."
            class="comment-input"
            rows="3"
            :disabled="isSubmittingComment"
          ></textarea>

          <div v-if="commentError" class="comment-form-error">
            {{ commentError }}
          </div>

          <div class="comment-form-actions">
            <BaseButton
              variant="primary"
              size="small"
              @click="submitComment"
              :loading="isSubmittingComment"
              :disabled="!commentText.trim()"
            >
              Publier
            </BaseButton>
            <BaseButton
              variant="ghost"
              size="small"
              @click="toggleCommentForm"
              :disabled="isSubmittingComment"
            >
              Annuler
            </BaseButton>
          </div>
        </div>
      </div>

      <!-- Liste des commentaires existants -->
      <div v-if="showComments">
        <div v-if="loadingComments" class="comments-loading">
          Chargement des commentaires...
        </div>

        <div v-else-if="errorComments" class="comments-error">
          {{ errorComments }}
          <BaseButton
            variant="ghost"
            size="small"
            @click="fetchComments"
            class="retry-button"
          >
            Réessayer
          </BaseButton>
        </div>

        <div v-else-if="comments.length === 0" class="comments-empty">
          Aucun commentaire pour ce post.
        </div>

        <div v-else class="comments-list">
          <div
            v-for="comment in comments"
            :key="comment.id"
            class="comment-item"
          >
            <div class="comment-header">
              <div class="comment-author">
                {{
                  comment.author
                    ? `${comment.author.firstName} ${comment.author.lastName}` ||
                      comment.author.email
                    : "Auteur inconnu"
                }}
              </div>
              <div class="comment-date">
                {{ formatDate(comment.createdAt) }}
              </div>
            </div>
            <div class="comment-content">
              {{ comment.body }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.post-container {
  display: flex;
  flex-direction: column;
  background-color: var(--color-bg-primary-dark);
  border: 1px solid var(--color-border-secondary);
  border-radius: 8px;
  padding: 16px;
  margin: 16px 0;
  transition: all 0.3s ease;
}

.post-container:hover {
  box-shadow: 0 4px 16px rgba(0, 255, 136, 0.2);
  transform: translateY(-2px);
  border: 1px solid var(--color-border-secondary-hover);
}

.btn-secondary {
  background: var(--color-secondary);
  color: #fff;

  border: 2px solid #ffd269;
}

.btn-secondary:hover {
  background: #ffd269;
  transform: translateY(-2px);
}

.btn {
  padding: 1rem 2rem;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
}

/* Style spécial pour les posts en highlight */
.post-container.highlighted {
  border: 2px solid var(--color-accent);
  box-shadow: 0 4px 16px rgba(0, 255, 136, 0.2);
  position: relative;
}

.post-container.highlighted::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;

  border-radius: 6px 6px 0 0;
}

.post-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 12px;
  gap: 16px;
}

.admin-controls {
  display: flex;
  gap: 8px;
  align-items: center;
}

.highlight-button {
  background: var(--color-secondary);
  color: var(--color-white);
  border: none;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.highlight-button:hover {
  background: var(--color-accent);
  transform: scale(1.1);
}

.highlight-button.active {
  background: var(--color-accent);
  color: var(--color-white);
  box-shadow: 0 2px 6px rgba(0, 255, 136, 0.3);
}

.delete-button {
  background: var(--color-error);
  color: var(--color-white);
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.delete-button:hover {
  background: var(--color-error-hover);
  transform: scale(1.1);
}

.author {
  color: var(--color-white);
  font-size: 1.2em;
}

.date {
  font-size: 0.8em;
  color: var(--color-secondary);
  font-weight: normal;
}

.post-content {
  margin-bottom: 12px;
  line-height: 1.5;
  color: var(--color-white);
}

.post-footer {
  display: flex;
  gap: 12px;
  align-items: center;
}

/* Styles pour le bouton like avec icône de cœur */
.like-button {
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.2s ease;
  color: var(--color-secondary);
}

.like-button:hover:not(:disabled) {
  background-color: rgba(255, 92, 92, 0.1);
  transform: translateY(-1px);
}

.like-button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.heart-icon {
  font-size: 18px;
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  color: var(--color-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.heart-icon.liked {
  color: #ff5c5c;
  transform: scale(1.2);
  text-shadow: 0 0 10px rgba(255, 92, 92, 0.5);
}

.heart-icon.liking {
  animation: heartBeat 0.6s ease-in-out;
}

@keyframes heartBeat {
  0% {
    transform: scale(1);
  }
  14% {
    transform: scale(1.3);
  }
  28% {
    transform: scale(1);
  }
  42% {
    transform: scale(1.3);
  }
  70% {
    transform: scale(1);
  }
}

.like-count {
  font-size: 0.85em;
  font-weight: 600;
  color: var(--color-white);
  min-width: 16px;
  text-align: left;
}

/* Styles pour la section des commentaires */
.comments-section {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--color-black);
}

.comments-loading {
  text-align: center;
  color: var(--color-secondary);
  padding: 16px;
  font-style: italic;
}

.comments-error {
  color: var(--color-error);
  text-align: center;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.comments-empty {
  text-align: center;
  color: var(--color-secondary);
  padding: 16px;
  font-style: italic;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.comment-item {
  background-color: var(--color-bg-secondary-dark);
  border: 1px solid var(--color-black);
  border-radius: 6px;
  padding: 12px;
  margin-left: 20px;
  position: relative;
}

.comment-item::before {
  content: "";
  position: absolute;
  left: -10px;
  top: 16px;
  width: 0;
  height: 0;
  border-top: 6px solid transparent;
  border-bottom: 6px solid transparent;
  border-right: 10px solid var(--color-bg-secondary-dark);
}

.comment-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 8px;
  gap: 12px;
}

.comment-author {
  color: var(--color-accent);
  font-weight: 600;
  font-size: 0.9em;
}

.comment-date {
  font-size: 0.75em;
  color: var(--color-secondary);
  opacity: 0.8;
}

.comment-content {
  line-height: 1.4;
  color: var(--color-white);
  font-size: 0.9em;
}

.retry-button {
  margin-top: 8px;
}

/* Styles pour le formulaire de commentaire */
.comment-form {
  background-color: var(--color-bg-secondary-dark);
  border: 1px solid var(--color-secondary);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.comment-form-header {
  margin-bottom: 12px;
}

.comment-form-header h4 {
  color: var(--color-white);
  margin: 0;
  font-size: 1.1em;
  font-weight: 600;
}

.comment-form-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.comment-input {
  width: 100%;
  background-color: var(--color-bg-primary-dark);
  border: 1px solid var(--color-black);
  border-radius: 6px;
  padding: 12px;
  color: var(--color-white);
  font-family: inherit;
  font-size: 0.9em;
  line-height: 1.4;
  resize: vertical;
  min-height: 80px;
  transition: border-color 0.2s ease;
}

.comment-input:focus {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: 0 0 0 2px rgba(0, 255, 136, 0.1);
}

.comment-input::placeholder {
  color: var(--color-secondary);
  opacity: 0.7;
}

.comment-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.comment-form-error {
  color: var(--color-error);
  font-size: 0.85em;
  padding: 8px 12px;
  background-color: rgba(255, 92, 92, 0.1);
  border: 1px solid var(--color-error);
  border-radius: 4px;
}

.comment-form-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}
</style>
