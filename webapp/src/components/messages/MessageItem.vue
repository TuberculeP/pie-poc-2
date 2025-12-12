<script setup lang="ts">
import type { DirectMessage } from "../../services/messages";
import { formatRelativeDate } from "../../lib/utils/dateFormatter";

defineProps<{
  message: DirectMessage;
  isOwn: boolean;
}>();
</script>

<template>
  <div class="message" :class="{ own: isOwn }">
    <div class="message-content">
      <p class="message-text">{{ message.body }}</p>
      <span class="message-time">{{
        formatRelativeDate(message.createdAt)
      }}</span>
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
</style>
