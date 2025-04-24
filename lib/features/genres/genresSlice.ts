import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchGenres } from "@/lib/services/genres";
import type { RootState } from "@/lib/store";
import type { MediaType } from "@/lib/features/media/mediaSlice";

export interface Genre {
  id: string;
  name: string;
}

export interface GenresParams {
  page?: number;
  limit?: number;
  name?: string;
  mediaType?: MediaType;
}

interface GenresState {
  items: Genre[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

const initialState: GenresState = {
  items: [],
  status: "idle",
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20,
  },
};

export const fetchAllGenres = createAsyncThunk(
  "genres/fetchAll",
  async (params: GenresParams = {}, { rejectWithValue }) => {
    try {
      const response = await fetchGenres(params);
      return response;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to fetch genres"
      );
    }
  }
);

const genresSlice = createSlice({
  name: "genres",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllGenres.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchAllGenres.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload.data;
        state.pagination = action.payload.meta.pagination;
        state.error = null;
      })
      .addCase(fetchAllGenres.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

// Selectors
export const selectAllGenres = (state: RootState) => state.genres.items;
export const selectGenresStatus = (state: RootState) => state.genres.status;
export const selectGenresError = (state: RootState) => state.genres.error;
export const selectGenresPagination = (state: RootState) =>
  state.genres.pagination;

export default genresSlice.reducer;
