import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { fetchMedia } from "@/lib/services/media";
import { Rating } from "../ratings/ratingsSlice";

export type MediaType = "MOVIE" | "GAME" | "MANGA" | null;
export type SortOption =
  | "popularity"
  | "releaseDate"
  | "averageRating"
  | "title";
export type SortOrder = "asc" | "desc";

export interface MediaFilters {
  page: number;
  limit: number;
  type: MediaType;
  genre: string | null;
  search: string;
  sortBy: SortOption;
  sortOrder: SortOrder;
}

export interface MediaItem {
  id: string;
  title: string;
  originalTitle?: string;
  mediaType: MediaType;
  description: string;
  coverImage: string;
  releaseDate: string;
  averageRating: number;
  genres: Array<{
    genreId: string;
    genre: {
      id: string;
      name: string;
    };
  }>;
  popularity: number;
}

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

interface MediaState {
  items: MediaItem[];
  filters: MediaFilters;
  pagination: PaginationMeta;
  genres: string[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: MediaState = {
  items: [],
  filters: {
    page: 1,
    limit: 12,
    type: null,
    genre: null,
    search: "",
    sortBy: "popularity",
    sortOrder: "desc",
  },
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 12,
  },
  genres: [],
  status: "idle",
  error: null,
};

export const fetchMediaItems = createAsyncThunk(
  "media/fetchMediaItems",
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { media: MediaState };
      const { filters } = state.media;
      const response = await fetchMedia(filters);
      return response;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to fetch media"
      );
    }
  }
);

const mediaSlice = createSlice({
  name: "media",
  initialState,
  reducers: {
    setFilter: (state, action: PayloadAction<Partial<MediaFilters>>) => {
      state.filters = { ...state.filters, ...action.payload, page: 1 }; // Reset to page 1 when filters change
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.filters.page = action.payload;
    },
    setLimit: (state, action: PayloadAction<number>) => {
      state.filters.limit = action.payload;
      state.filters.page = 1; // Reset to page 1 when limit changes
    },
    setGenres: (state, action: PayloadAction<string[]>) => {
      state.genres = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMediaItems.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchMediaItems.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload.data;
        state.pagination = action.payload.meta.pagination;

        // Extract unique genres if not already populated
        if (state.genres.length === 0) {
          const uniqueGenres = new Set<string>();
          action.payload.data.forEach((item: MediaItem) => {
            item.genres.forEach((g) => uniqueGenres.add(g.genre.name));
          });
          state.genres = Array.from(uniqueGenres);
        }
      })
      .addCase(fetchMediaItems.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export const { setFilter, setPage, setLimit, setGenres } = mediaSlice.actions;

export default mediaSlice.reducer;
