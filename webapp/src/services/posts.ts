// services/posts.ts
import apiClient from "../lib/utils/apiClient";
import type { Post } from "../lib/utils/types";

export interface CreatePostData {
  body: string;
  tags?: string[];
  comment_of?: number | null;
  is_highlight?: boolean;
}

export const getAllPosts = async (): Promise<Post[]> => {
  const { data, error } = await apiClient.get<{ body: Post[] }>("/posts");

  if (!data || error) {
    console.error("Error fetching posts:", error);
    return [];
  } else {
    return data.body;
  }
};

export const getPostById = async (id: string): Promise<Post> => {
  const { data, error } = await apiClient.get<{ body: Post }>(`/posts/${id}`);
  if (!data || error) {
    console.error("Error fetching posts:", error);
    throw new Error("Post not found");
  } else {
    return data.body;
  }
};

export const createPost = async (
  payload: Pick<Post, "body" | "tags" | "comment_of" | "is_highlight">
): Promise<Post> => {
  const { data, error } = await apiClient.post<{ body: Post }>(
    "/posts",
    payload
  );
  if (!data || error) {
    console.error("Error creating post:", error);
    throw new Error("Failed to create post");
  } else {
    return data.body;
  }
};

export const updatePost = async (
  id: string,
  payload: Partial<Post>
): Promise<Post> => {
  const { data, error } = await apiClient.patch<{ body: Post }>(
    `/posts/${id}`,
    payload
  );
  if (!data || error) {
    console.error("Error updating post:", error);
    throw new Error("Failed to update post");
  } else {
    return data.body;
  }
};

export const deletePost = async (id: number): Promise<void> => {
  await apiClient.delete(`/posts/${id}`);
};
