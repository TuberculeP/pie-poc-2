<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";
import { useAuthStore } from "../../stores/authStore";
import { useMessages } from "../../lib/composables/useMessages";
import ConversationSidebar from "../../components/messages/ConversationSidebar.vue";
import MessageThread from "../../components/messages/MessageThread.vue";
import LandingLayout from "../../layouts/LandingLayout.vue";
import LandingHeader from "../../components/landing/LandingHeader.vue";

const authStore = useAuthStore();

const {
  conversations,
  currentMessages,
  selectedUser,
  allUsers,
  showNewConversation,
  userSearch,
  isTyping,
  typingUser,
  newMessageText,
  loading,
  loadingMessages,
  sending,
  selectConversation,
  startNewConversation,
  handleSendMessage,
  handleTyping,
  init,
  cleanup,
} = useMessages();

onMounted(init);
onUnmounted(cleanup);
</script>

<template>
  <LandingLayout>
    <LandingHeader sticky />
    <div class="messages-page">
      <div class="messages-container">
        <!-- Sidebar -->
        <ConversationSidebar
          :conversations="conversations"
          :all-users="allUsers"
          :selected-user-id="selectedUser?.id || null"
          :loading="loading"
          :show-new-conversation="showNewConversation"
          :user-search="userSearch"
          @update:show-new-conversation="showNewConversation = $event"
          @update:user-search="userSearch = $event"
          @select-conversation="selectConversation"
          @start-new-conversation="startNewConversation"
        />

        <!-- Zone de messages -->
        <main class="messages-area">
          <MessageThread
            v-if="selectedUser"
            :user="selectedUser"
            :messages="currentMessages"
            :current-user-id="authStore.user?.id || ''"
            :loading="loadingMessages"
            :sending="sending"
            :is-typing="isTyping"
            :typing-user="typingUser"
            v-model:message-text="newMessageText"
            @send="handleSendMessage"
            @typing="handleTyping"
          />

          <!-- Aucune conversation sélectionnée -->
          <div v-else class="no-selection">
            <div class="no-selection-content">
              <i class="fas fa-comments no-selection-icon"></i>
              <h3>Sélectionnez une conversation</h3>
              <p>Choisissez une conversation ou démarrez-en une nouvelle</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  </LandingLayout>
</template>

<style scoped>
.messages-page {
  min-height: calc(100vh - 80px);
  background: var(--bg-primary);
  padding: 2rem;
  color: var(--color-white);
  margin-top: 120px;
}

.messages-container {
  display: flex;
  margin: 0 auto;
  height: calc(100vh - 80px - 4rem);
  background: var(--color-bg-secondary-dark);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.messages-area {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.no-selection {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-white);
}

.no-selection-content {
  text-align: center;
}

.no-selection-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.3;
}

.no-selection h3 {
  margin-bottom: 0.5rem;
}

@media (max-width: 768px) {
  .messages-container {
    flex-direction: column;
    height: auto;
  }

  .messages-area {
    min-height: 400px;
  }
}
</style>
