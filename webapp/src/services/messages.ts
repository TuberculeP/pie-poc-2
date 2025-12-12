import apiClient from "../lib/utils/apiClient";

export interface MessageUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface DirectMessage {
  id: string;
  sender: MessageUser;
  receiver: MessageUser;
  body: string;
  isRead: boolean;
  createdAt: string;
}

export interface Conversation {
  user: MessageUser;
  lastMessage: DirectMessage;
  unreadCount: number;
}

// Récupérer toutes les conversations
export const getConversations = async (): Promise<Conversation[]> => {
  const { data, error } = await apiClient.get<{ body: Conversation[] }>(
    "/messages/conversations",
  );
  if (!data || error) {
    console.error("Error fetching conversations:", error);
    return [];
  }
  return data.body;
};

// Récupérer les messages d'une conversation
export const getConversationMessages = async (
  userId: string,
): Promise<DirectMessage[]> => {
  const { data, error } = await apiClient.get<{ body: DirectMessage[] }>(
    `/messages/conversation/${userId}`,
  );
  if (!data || error) {
    console.error("Error fetching messages:", error);
    return [];
  }
  return data.body;
};

// Envoyer un message
export const sendMessage = async (
  receiverId: string,
  body: string,
): Promise<DirectMessage | null> => {
  const { data, error } = await apiClient.post<{ body: DirectMessage }>(
    "/messages",
    { receiverId, body },
  );
  if (!data || error) {
    console.error("Error sending message:", error);
    return null;
  }
  return data.body;
};

// Supprimer un message
export const deleteMessage = async (id: string): Promise<boolean> => {
  const { error } = await apiClient.delete(`/messages/${id}`);
  return !error;
};

// Récupérer tous les utilisateurs
export const getUsers = async (): Promise<MessageUser[]> => {
  const { data, error } = await apiClient.get<{ body: MessageUser[] }>(
    "/messages/users",
  );
  if (!data || error) {
    console.error("Error fetching users:", error);
    return [];
  }
  return data.body;
};
