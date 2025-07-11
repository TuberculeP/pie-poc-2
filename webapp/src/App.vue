<script setup lang="ts">
import { onSocketConnected } from "./lib/utils/websocket";

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
