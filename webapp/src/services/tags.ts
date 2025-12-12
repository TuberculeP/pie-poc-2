// services/tags.ts
import apiClient from "../lib/utils/apiClient";

export interface Tag {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
}

export interface PopularTag {
  id: string;
  name: string;
  postCount: string;
}

export const getAllTags = async (): Promise<Tag[]> => {
  const { data, error } = await apiClient.get<{ body: Tag[] }>("/tags");

  if (!data || error) {
    console.error("Error fetching tags:", error);
    return [];
  }
  return data.body;
};

export const getPopularTags = async (): Promise<PopularTag[]> => {
  const { data, error } = await apiClient.get<{ body: PopularTag[] }>(
    "/tags/popular"
  );

  if (!data || error) {
    console.error("Error fetching popular tags:", error);
    return [];
  }
  return data.body;
};

export const createTag = async (name: string): Promise<Tag> => {
  const { data, error } = await apiClient.post<{ body: Tag }>("/tags", {
    name,
  });

  if (!data || error) {
    console.error("Error creating tag:", error);
    throw new Error("Failed to create tag");
  }
  return data.body;
};

// Liste de tags pré-enregistrés par défaut (genres musicaux)
export const defaultTags = [
  "Electro",
  "LoFi",
  "Synthwave",
  "House",
  "Techno",
  "Ambient",
  "Hip-Hop",
  "Jazz",
  "Classical",
  "Rock",
  "Pop",
  "R&B",
  "Drum & Bass",
  "Dubstep",
  "Trance",
  "Indie",
  "Folk",
  "Metal",
  "Funk",
  "Soul",
  "Reggae",
  "Blues",
  "Country",
  "Disco",
  "Trap",
  "Chillout",
  "Experimental",
  "Orchestral",
  "Cinematic",
  "8-bit",
];
