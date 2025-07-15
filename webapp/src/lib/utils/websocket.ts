import { reactive } from "vue";
import { io, Socket } from "socket.io-client";

const state = reactive({
  connected: false,
  _immediateListeners: [] as Array<(socket: Socket) => void>,
  _eventListeners: {} as Record<string, Array<(...args: any[]) => void>>,
});

const socket = io({
  transports: ["websocket"],
});

export const onSocketConnected = (callback: (socket: Socket) => void) => {
  if (state.connected) {
    callback(socket);
  } else {
    state._immediateListeners.push(callback);
  }
};

export const onSocketEvent = (
  event: string,
  callback: (...args: any[]) => void,
) => {
  // one event can have multiple listeners
  if (!state._eventListeners[event]) {
    state._eventListeners[event] = [];
  }
  state._eventListeners[event].push(callback);
  // return a function to remove the listener
  return () => {
    state._eventListeners[event] = state._eventListeners[event].filter(
      (listener) => listener !== callback,
    );
  };
};

socket.on("connect", () => {
  state.connected = true;
  console.log("WebSocket connected");
  state._immediateListeners.forEach((cb) => cb(socket));
  state._immediateListeners.splice(0);
});

socket.on("disconnect", () => {
  state.connected = false;
  console.log("WebSocket disconnected");
});

socket.onAny((event, ...args) => {
  const listeners = state._eventListeners[event] || [];
  listeners.forEach((listener) => listener(...args));
});
