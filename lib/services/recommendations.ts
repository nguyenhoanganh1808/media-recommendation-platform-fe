import axios from "axios";
import type {
  RecommendationsParams,
  UserPreferences,
} from "@/lib/features/recommendations/recommendationsSlice";
import { api } from "./api";
import { MediaItem } from "../features/media/mediaSlice";

interface RecommendationsResponse {
  data: MediaItem[];
  meta?: {
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  };
}

// Fetch personalized recommendations
export const fetchPersonalizedRecommendations = async (
  params: RecommendationsParams = {}
): Promise<RecommendationsResponse> => {
  try {
    const response = await api.get("/recommendations", { params });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ||
          "Failed to fetch personalized recommendations"
      );
    }
    throw error;
  }
};

// Fetch trending media
export const fetchTrendingMedia = async (
  params: RecommendationsParams = {}
): Promise<RecommendationsResponse> => {
  try {
    const response = await api.get("/recommendations/trending", { params });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch trending media"
      );
    }
    throw error;
  }
};

// Fetch similar media
export const fetchSimilarMedia = async (
  mediaId: string
): Promise<RecommendationsResponse> => {
  try {
    const response = await api.get(`/recommendations/media/${mediaId}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch similar media"
      );
    }
    throw error;
  }
};

// Update user preferences
export const updateUserPreferences = async (
  userId: string,
  preferences: UserPreferences
): Promise<void> => {
  try {
    await api.put(`/recommendations/preferences/${userId}`, preferences);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Failed to update preferences"
      );
    }
    throw error;
  }
};
