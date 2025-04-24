import axios from "axios";
import type { Genre, GenresParams } from "@/lib/features/genres/genresSlice";
import { api } from "./api";

interface GenresResponse {
  data: Genre[];
  meta: {
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  };
}

// Fetch genres
export const fetchGenres = async (
  params: GenresParams = {}
): Promise<GenresResponse> => {
  try {
    const response = await api.get("/genres", { params });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch genres"
      );
    }
    throw error;
  }
};
