// services/posts.ts
import axios from "axios";

// Configuration d'axios pour inclure les cookies de session
axios.defaults.withCredentials = true;

export interface Post {
  author: {
    id: string;
    firstName?: string; // Ajout d'un champ name pour l'auteur
    lastName?: string; // Champ lastname pour compatibilité
    email: string;
  };
  id?: number;
  body: string;
  tags?: string[];
  comment_of?: number | null;
  comments?: Post[];
  is_highlight?: boolean;
  highlight_on_tag?: boolean;
  pinned_by_user?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePostData {
  body: string;
  tags?: string[];
  comment_of?: number | null;
  is_highlight?: boolean;
}

const API_URL = "http://localhost:3000/api/posts";

export const getAllPosts = async (): Promise<Post[]> => {
  try {
    const response = await axios.get(API_URL);
    console.log("Response from API:", response.data); // Debug log

    // Vérifier la structure de la réponse
    if (
      response.data &&
      response.data.body &&
      Array.isArray(response.data.body)
    ) {
      return response.data.body;
    } else {
      console.warn("Unexpected API response structure:", response.data);
      return [];
    }
  } catch (error) {
    console.error("Error fetching posts:", error);
    throw error;
  }
};

export const getPostById = async (id: string): Promise<Post> => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data.body;
};

export const createPost = async (data: CreatePostData): Promise<Post> => {
  const response = await axios.post(API_URL, data);
  return response.data.body;
};

export const updatePost = async (
  id: string,
  data: Partial<Post>,
): Promise<Post> => {
  const response = await axios.patch(`${API_URL}/${id}`, data);
  return response.data.body;
};

export const deletePost = async (id: number): Promise<void> => {
  await axios.delete(`${API_URL}/${id}`);
};
