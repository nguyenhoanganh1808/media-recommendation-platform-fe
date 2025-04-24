import axios from "axios";
import { api } from "./api";
import {
  MediaFilters,
  MediaItem,
  PaginationMeta,
} from "@/lib/features/media/mediaSlice";

interface MediaResponse {
  data: MediaItem[];
  meta: {
    pagination: PaginationMeta;
  };
}

export const fetchMedia = async (
  filters: MediaFilters
): Promise<MediaResponse> => {
  try {
    const response = await api.get("/media", { params: filters });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Failed to fetch media");
    }
    throw error;
  }
};
export const fetchMediaDetails = async (id: string): Promise<MediaItem> => {
  try {
    const response = await api.get(`/media/${id}`);
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch media details"
      );
    }
    throw error;
  }
};
