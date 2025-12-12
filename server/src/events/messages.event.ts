import type { Socket } from "socket.io";
import type { EventGroup } from "./event_handler";
import pg from "../config/db.config";
import { DirectMessage } from "../config/entities/DirectMessage";
import { User } from "../config/entities/User";

// Map pour garder la trace des utilisateurs connectés (userId -> socketId)
export const connectedUsers = new Map<string, string>();

const messagesEvents: EventGroup = {
  // Quand un utilisateur se connecte, il s'enregistre avec son userId
  register: ({ ws, data }) => {
    if (!ws || !data?.userId) return;

    connectedUsers.set(data.userId, ws.id);
    console.log(`User ${data.userId} registered with socket ${ws.id}`);

    // Notifier l'utilisateur qu'il est bien connecté
    ws.emit("messages:registered", { success: true });
  },

  // Quand un utilisateur se déconnecte
  unregister: ({ data }) => {
    if (!data?.userId) return;

    connectedUsers.delete(data.userId);
    console.log(`User ${data.userId} unregistered`);
  },

  // Envoyer un message en temps réel
  send: async ({ ws, data }) => {
    if (!ws || !data?.receiverId || !data?.body || !data?.senderId) {
      ws?.emit("messages:error", { message: "Missing data" });
      return;
    }

    try {
      const userRepository = pg.getRepository(User);
      const messageRepository = pg.getRepository(DirectMessage);

      const sender = await userRepository.findOneBy({ id: data.senderId });
      const receiver = await userRepository.findOneBy({ id: data.receiverId });

      if (!sender || !receiver) {
        ws.emit("messages:error", { message: "User not found" });
        return;
      }

      // Créer et sauvegarder le message
      const newMessage = messageRepository.create({
        sender,
        receiver,
        body: data.body,
      });

      await messageRepository.save(newMessage);

      // Préparer le message à envoyer
      const messagePayload = {
        id: newMessage.id,
        sender: {
          id: sender.id,
          firstName: sender.firstName,
          lastName: sender.lastName,
          email: sender.email,
        },
        receiver: {
          id: receiver.id,
          firstName: receiver.firstName,
          lastName: receiver.lastName,
          email: receiver.email,
        },
        body: newMessage.body,
        isRead: false,
        createdAt: newMessage.createdAt,
      };

      // Envoyer au sender (confirmation)
      ws.emit("messages:sent", messagePayload);

      // Envoyer au receiver s'il est connecté
      const receiverSocketId = connectedUsers.get(data.receiverId);
      if (receiverSocketId) {
        ws.to(receiverSocketId).emit("messages:new", messagePayload);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      ws.emit("messages:error", { message: "Failed to send message" });
    }
  },

  // Marquer les messages comme lus
  markRead: async ({ ws, data }) => {
    if (!data?.conversationUserId || !data?.currentUserId) return;

    try {
      const messageRepository = pg.getRepository(DirectMessage);

      await messageRepository
        .createQueryBuilder()
        .update(DirectMessage)
        .set({ isRead: true })
        .where(
          "senderId = :senderId AND receiverId = :receiverId AND isRead = false",
          {
            senderId: data.conversationUserId,
            receiverId: data.currentUserId,
          },
        )
        .execute();

      ws?.emit("messages:markedRead", { success: true });
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  },

  // Notification de typing
  typing: ({ ws, data }) => {
    if (!data?.receiverId || !data?.senderId) return;

    const receiverSocketId = connectedUsers.get(data.receiverId);
    if (receiverSocketId) {
      ws?.to(receiverSocketId).emit("messages:typing", {
        senderId: data.senderId,
        isTyping: data.isTyping,
      });
    }
  },
};

// Gérer la déconnexion des sockets
export const handleDisconnect = (socket: Socket) => {
  // Trouver et supprimer l'utilisateur déconnecté
  for (const [userId, socketId] of connectedUsers.entries()) {
    if (socketId === socket.id) {
      connectedUsers.delete(userId);
      console.log(`User ${userId} disconnected`);
      break;
    }
  }
};

export default messagesEvents;
