<script setup lang="ts">
import { computed } from "vue";
import type { Conversation, MessageUser } from "../../services/messages";
import BaseButton from "../ui/BaseButton.vue";
import ConversationItem from "./ConversationItem.vue";
import UserSearchList from "./UserSearchList.vue";

const props = defineProps<{
  conversations: Conversation[];
  allUsers: MessageUser[];
  selectedUserId: string | null;
  loading: boolean;
  showNewConversation: boolean;
  userSearch: string;
}>();

const emit = defineEmits<{
  "update:showNewConversation": [value: boolean];
  "update:userSearch": [value: string];
  selectConversation: [user: MessageUser];
  startNewConversation: [user: MessageUser];
}>();

// Filtrer les utilisateurs pour nouvelle conversation
const filteredUsers = computed(() => {
  if (!props.allUsers) return [];
  return props.allUsers.filter(
    (u) =>
      u.firstName.toLowerCase().includes(props.userSearch.toLowerCase()) ||
      u.lastName.toLowerCase().includes(props.userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(props.userSearch.toLowerCase()),
  );
});

const toggleNewConversation = () => {
  emit("update:showNewConversation", !props.showNewConversation);
};

const handleUserSearch = (value: string) => {
  emit("update:userSearch", value);
};

const handleStartNewConversation = (user: MessageUser) => {
  emit("startNewConversation", user);
  emit("update:userSearch", "");
};
</script>

<template>
  <aside class="conversations-sidebar">
    <div class="sidebar-header">
      <h2>Messages</h2>
      <BaseButton variant="primary" size="small" @click="toggleNewConversation">
        <i class="fas fa-plus"></i>
      </BaseButton>
    </div>

    <!-- Nouvelle conversation -->
    <UserSearchList
      v-if="showNewConversation"
      :users="filteredUsers"
      :search-query="userSearch"
      @update:search-query="handleUserSearch"
      @select="handleStartNewConversation"
    />

    <!-- Liste des conversations -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
    </div>
    <div v-else class="conversations-list">
      <ConversationItem
        v-for="conv in conversations"
        :key="conv.user.id"
        :conversation="conv"
        :is-active="selectedUserId === conv.user.id"
        @select="$emit('selectConversation', conv.user)"
      />
      <div
        v-if="!conversations || conversations.length === 0"
        class="no-conversations"
      >
        <p>Aucune conversation</p>
        <p class="hint">Cliquez sur + pour démarrer</p>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.conversations-sidebar {
  width: 320px;
  border-right: 1px solid var(--color-border-secondary);
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--color-border-secondary);
}

.sidebar-header h2 {
  margin: 0;
  font-size: 1.25rem;
}

.conversations-list {
  flex: 1;
  overflow-y: auto;
  background-color: var(--color-bg-secondary-dark);
  border-radius: 8px;
}

.no-conversations {
  text-align: center;
  padding: 2rem;
}

.no-conversations .hint {
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.loading-state {
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

@media (max-width: 768px) {
  .conversations-sidebar {
    width: 100%;
    max-height: 300px;
  }
}
</style>
