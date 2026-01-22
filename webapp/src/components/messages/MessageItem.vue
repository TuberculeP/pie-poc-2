<script setup lang="ts">
import { ref, computed } from "vue";
import type { DirectMessage } from "../../services/messages";
import { formatRelativeDate } from "../../lib/utils/dateFormatter";
import { likeMessage, unlikeMessage } from "../../services/messages";
import { useAuthStore } from "../../stores/authStore";

const props = defineProps<{
  message: DirectMessage;
  isOwn: boolean;
}>();

const emit = defineEmits<{
  messageLiked: [messageId: string];
  messageUnliked: [messageId: string];
}>();

const authStore = useAuthStore();
const isLiking = ref(false);

const currentUserLike = computed(() => {
  if (!props.message.likes || !authStore.user) return null;
  return props.message.likes.find((like) => like.user.id === authStore.user?.id);
});

const likeCount = computed(() => {
  return props.message.likes?.length ?? 0;
});

const handleLike = async () => {
  if (isLiking.value || currentUserLike.value) return;

  isLiking.value = true;
  const success = await likeMessage(props.message.id);
  isLiking.value = false;

  if (success && props.message.likes) {
    emit("messageLiked", props.message.id);
  }
};

const handleUnlike = async () => {
  if (isLiking.value || !currentUserLike.value) return;

  isLiking.value = true;
  const success = await unlikeMessage(props.message.id);
  isLiking.value = false;

  if (success) {
    emit("messageUnliked", props.message.id);
  }
};

const toggleLike = () => {
  if (currentUserLike.value) {
    handleUnlike();
  } else {
    handleLike();
  }
};
</script>

<template>
  <div class="message" :class="{ own: isOwn }">
    <div class="message-content">
      <p class="message-text">{{ message.body }}</p>
      <span class="message-time">{{
        formatRelativeDate(message.createdAt)
      }}</span>
      <div class="message-actions">
        <button
          v-if="!isOwn"
          class="like-button"
          :class="{ liked: currentUserLike }"
          @click="toggleLike"
          :disabled="isLiking"
          :title="currentUserLike ? 'Unlike' : 'Like'"
        >
          <span class="heart">{{ currentUserLike ? "❤️" : "Like" }}</span>
          <span v-if="likeCount > 0" class="like-count">{{ likeCount }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.message {
  display: flex;
  max-width: 70%;
}

.message.own {
  align-self: flex-end;
}

.message-content {
  padding: 0.75rem 1rem;
  border-radius: 18px;
  background: var(--color-bg-secondary-dark);
  color: var(--color-white);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  position: relative;
}

/* Bulle pour les messages reçus (queue à gauche) */
.message:not(.own) .message-content {
  background: var(--color-primary);
  border-bottom-left-radius: 4px;
}

/* Bulle pour les messages envoyés (queue à droite) */
.message.own .message-content {
  background: var(--color-secondary);
  color: var(--color-white);
  border-bottom-right-radius: 4px;
}

.message-text {
  margin: 0 0 0.25rem 0;
  word-wrap: break-word;
  line-height: 1.4;
}

.message-time {
  font-size: 0.7rem;
  opacity: 0.7;
  display: block;
  text-align: right;
}

.message-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 0.5rem;
  gap: 0.5rem;
}

.like-button {
  background: none;
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  transition: background-color 0.2s ease;
  font-size: 0.85rem;
  opacity: 0.8;
}

.like-button:hover:not(:disabled) {
  opacity: 1;
  background-color: rgba(255, 255, 255, 0.1);
}

.like-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.like-button.liked {
  opacity: 1;
}

.heart {
  font-size: 0.9rem;
}

.like-count {
  font-size: 0.75rem;
  font-weight: 500;
}
</style>
