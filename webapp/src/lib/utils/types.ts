export interface Foo {
  id: number;
  bar: string;
}

export type Note = {
  frequency: number;
  key: string;
  color: string;
  scale: string;
};

export type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  role: string;
  following: User[];
  followers: Record<string, any>[];
  posts: Record<string, any>[];
  likedPosts: Record<string, any>[];
  subscription: Record<string, any>;
  sentMessages: Record<string, any>[];
  receivedMessages: Record<string, any>[];
  createdAt: Date;
};

export interface Post {
  id?: number;
  author: User;
  body: string;
  tags?: string[];
  comment_of?: number | null;
  comment_of_post_id?: number | null;
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
  comment_of_post_id?: string | null;
  is_highlight?: boolean;
}
