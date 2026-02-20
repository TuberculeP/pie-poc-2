<script setup lang="ts">
import { onMounted } from "vue";
import { onSocketConnected } from "./lib/utils/websocket";
import { useAuthStore } from "./stores/authStore";
import apiClient from "./lib/utils/apiClient";
import type { User } from "./lib/utils/types";

const authStore = useAuthStore();

onMounted(async () => {
  const check = await apiClient.get<{ user: User }>("/auth/check");
  if (check.data?.user) {
    authStore.user = check.data.user;
  }
});

onSocketConnected((socket) => {
  socket.emit("test", { message: "Hello from Vue!" });
});
</script>

<template>
  <RouterView />
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
</style>
