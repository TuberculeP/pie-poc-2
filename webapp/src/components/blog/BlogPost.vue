<script setup lang="ts">
import { defineProps, defineEmits, computed, ref } from "vue";
import { useRouter } from "vue-router";
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
  showExpanded?: boolean; // Pour afficher en mode étendu sur la page de détail
}>();

const emit = defineEmits<{
  refresh: [];
}>();

const router = useRouter();
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
      await updatePost(String(props.post.id), {
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

// Navigation vers la page de détail
const goToPostDetail = () => {
  console.log("clicked post", props.post.id);

  if (props.post.id) {
    console.log("Navigating to post detail:", props.post.id);
    router.push(`/blog/post/${props.post.id}`);
  }
};

const goToAuthorProfile = () => {};
</script>
<template>
  <div
    class="post-container"
    :class="{
      highlighted: post.is_highlight,
    }"
    @click="goToPostDetail"
  >
    <div class="post-header">
      <div class="author" @click.stop="goToAuthorProfile">
        {{
          post.author
            ? `${post.author.firstName} ${post.author.lastName}` ||
              post.author.email
            : "Auteur inconnu"
        }}
      </div>
      <div class="date">{{ formatDate(post.createdAt) }}</div>

      <!-- Boutons d'administration (visibles seulement pour les admins) -->
      <div v-if="isAdmin" class="admin-controls" @click.stop>
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
    <div class="post-footer" @click.stop>
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
    <div v-if="showComments || showCommentForm" class="comments-section" @click.stop>
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
