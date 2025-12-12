<script setup lang="ts">
import { ref, nextTick, watch } from "vue";
import type { DirectMessage, MessageUser } from "../../services/messages";
import MessageItem from "./MessageItem.vue";
import MessageInput from "./MessageInput.vue";

const props = defineProps<{
  user: MessageUser;
  messages: DirectMessage[];
  currentUserId: string;
  loading: boolean;
  sending: boolean;
  isTyping: boolean;
  typingUser: string | null;
}>();

const newMessageText = defineModel<string>("messageText", { default: "" });

defineEmits<{
  send: [];
  typing: [];
}>();

const messagesContainer = ref<HTMLElement | null>(null);

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};

const isOwnMessage = (message: DirectMessage) => {
  return message.sender.id === props.currentUserId;
};

// Scroll automatique quand les messages changent
watch(
  () => props.messages.length,
  async () => {
    await nextTick();
    scrollToBottom();
  },
);

defineExpose({ scrollToBottom });
</script>

<template>
  <div class="message-thread">
    <!-- Header de la conversation -->
    <div class="messages-header">
      <div class="header-user">
        <div class="header-avatar">
          {{ user.firstName[0] }}{{ user.lastName[0] }}
        </div>
        <div class="header-info">
          <span class="header-name"
            >{{ user.firstName }} {{ user.lastName }}</span
          >
          <span class="header-email">{{ user.email }}</span>
        </div>
      </div>
    </div>

    <!-- Messages -->
    <div ref="messagesContainer" class="messages-list">
      <div v-if="loading" class="loading-messages">
        <div class="loading-spinner"></div>
      </div>
      <template v-else>
        <MessageItem
          v-for="message in messages"
          :key="message.id"
          :message="message"
          :is-own="isOwnMessage(message)"
        />
        <div v-if="!messages || messages.length === 0" class="no-messages">
          <p>Aucun message</p>
          <p class="hint">Envoyez le premier message !</p>
        </div>
        <!-- Indicateur de frappe -->
        <div v-if="isTyping" class="typing-indicator">
          <span class="typing-dots">
            <span></span>
            <span></span>
            <span></span>
          </span>
          <span class="typing-text">{{ typingUser }} écrit...</span>
        </div>
      </template>
    </div>

    <!-- Zone de saisie -->
    <MessageInput
      v-model="newMessageText"
      :sending="sending"
      @send="$emit('send')"
      @typing="$emit('typing')"
    />
  </div>
</template>

<style scoped>
.message-thread {
  overflow: scroll;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.messages-header {
  /* padding: 1rem 1.5rem; */
  border-bottom: 1px solid var(--color-border-secondary);
  background: var(--color-bg-secondary-dark);
}

.header-user {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  border-radius: 8px;
  padding: 8px;
}

.header-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--accent-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
}

.header-info {
  display: flex;
  flex-direction: column;
}

.header-name {
  font-weight: 600;
}

.header-email {
  font-size: 0.75rem;
}

.messages-list {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.no-messages {
  text-align: center;
  margin: auto;
}

.no-messages .hint {
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.loading-messages {
  display: flex;
  justify-content: center;
  padding: 2rem;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--color-border-secondary);
  border-top-color: var(--accent-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.typing-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.typing-dots {
  display: flex;
  gap: 3px;
}

.typing-dots span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  animation: typing-bounce 1.4s infinite ease-in-out;
}

.typing-dots span:nth-child(1) {
  animation-delay: 0s;
}

.typing-dots span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-dots span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing-bounce {
  0%,
  60%,
  100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-4px);
  }
}

.typing-text {
  font-style: italic;
}
</style>
