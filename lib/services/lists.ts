import axios from "axios";
import type {
  MediaListDetails,
  MediaList,
  ListItem,
} from "@/lib/features/lists/listsSlice";
import { api } from "./api";

interface ListsResponse {
  data: MediaList[];
  meta: {
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  };
}

// Fetch user's lists
export const fetchUserLists = async (
  page = 1,
  limit = 10
): Promise<ListsResponse> => {
  try {
    const response = await api.get(`/lists?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Failed to fetch lists");
    }
    throw error;
  }
};

// Fetch list details including items
export const fetchListDetails = async (
  listId: string
): Promise<MediaListDetails> => {
  try {
    const response = await api.get(`/lists/${listId}`);
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch list details"
      );
    }
    throw error;
  }
};

// Create a new list
export const createList = async ({
  name,
  description,
  isPublic,
}: {
  name: string;
  description?: string;
  isPublic: boolean;
}): Promise<MediaList> => {
  try {
    const response = await api.post("/lists", { name, description, isPublic });
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Failed to create list");
    }
    throw error;
  }
};

// Update an existing list
export const updateList = async (
  listId: string,
  {
    name,
    description,
    isPublic,
  }: {
    name: string;
    description?: string;
    isPublic: boolean;
  }
): Promise<MediaList> => {
  try {
    const response = await api.put(`/lists/${listId}`, {
      name,
      description,
      isPublic,
    });
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Failed to update list");
    }
    throw error;
  }
};

// Delete a list
export const deleteList = async (listId: string): Promise<void> => {
  try {
    await api.delete(`/lists/${listId}`);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Failed to delete list");
    }
    throw error;
  }
};

// Add item to list
export const addItemToList = async (
  listId: string,
  mediaId: string,
  notes?: string
): Promise<ListItem> => {
  try {
    const response = await api.post(`/lists/${listId}/items`, {
      mediaId,
      notes,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Failed to add item to list"
      );
    }
    throw error;
  }
};

// Update item in list
export const updateItemInList = async (
  itemId: string,
  notes?: string
): Promise<ListItem> => {
  try {
    const response = await api.put(`/lists/items/${itemId}`, { notes });
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Failed to update item in list"
      );
    }
    throw error;
  }
};

// Remove item from list
export const removeItemFromList = async (itemId: string): Promise<void> => {
  try {
    await api.delete(`/lists/items/${itemId}`);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Failed to remove item from list"
      );
    }
    throw error;
  }
};

// Reorder list items
export const reorderList = async (
  listId: string,
  items: { id: string; order: number }[]
): Promise<void> => {
  try {
    await api.put(`/lists/${listId}/reorder`, { items });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Failed to reorder list"
      );
    }
    throw error;
  }
};
