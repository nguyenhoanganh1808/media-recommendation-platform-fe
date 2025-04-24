import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchPersonalizedRecommendations,
  fetchTrendingMedia,
  fetchSimilarMedia,
  updateUserPreferences,
} from "@/lib/services/recommendations";
import type { MediaItem, MediaType } from "@/lib/features/media/mediaSlice";
import type { RootState } from "@/lib/store";

export interface RecommendationsParams {
  limit?: number;
  page?: number;
  mediaType?: MediaType;
  includeRated?: boolean;
}

export interface UserPreferences {
  genreIds: string[];
  mediaTypePreferences: {
    type: "MOVIE" | "GAME" | "MANGA";
    strength: number;
  }[];
}

interface RecommendationsState {
  personalized: MediaItem[];
  trending: MediaItem[];
  similar: Record<string, MediaItem[]>;
  preferences: UserPreferences | null;
  personalizedStatus: "idle" | "loading" | "succeeded" | "failed";
  trendingStatus: "idle" | "loading" | "succeeded" | "failed";
  similarStatus: Record<string, "idle" | "loading" | "succeeded" | "failed">;
  preferencesStatus: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

const initialState: RecommendationsState = {
  personalized: [],
  trending: [],
  similar: {},
  preferences: null,
  personalizedStatus: "idle",
  trendingStatus: "idle",
  similarStatus: {},
  preferencesStatus: "idle",
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  },
};

// Async thunks
export const fetchPersonalized = createAsyncThunk(
  "recommendations/fetchPersonalized",
  async (params: RecommendationsParams = {}, { rejectWithValue }) => {
    try {
      const response = await fetchPersonalizedRecommendations(params);
      return response;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : "Failed to fetch personalized recommendations"
      );
    }
  }
);

export const fetchTrending = createAsyncThunk(
  "recommendations/fetchTrending",
  async (params: RecommendationsParams = {}, { rejectWithValue }) => {
    try {
      const response = await fetchTrendingMedia(params);
      return response;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : "Failed to fetch trending media"
      );
    }
  }
);

export const fetchSimilar = createAsyncThunk(
  "recommendations/fetchSimilar",
  async (mediaId: string, { rejectWithValue }) => {
    try {
      const response = await fetchSimilarMedia(mediaId);
      return { mediaId, data: response.data };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to fetch similar media"
      );
    }
  }
);

export const saveUserPreferences = createAsyncThunk<
  UserPreferences,
  { userId: string; preferences: UserPreferences },
  { rejectValue: string }
>(
  "recommendations/saveUserPreferences",
  async ({ userId, preferences }, { rejectWithValue }) => {
    try {
      await updateUserPreferences(userId, preferences);
      return preferences;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to update preferences"
      );
    }
  }
);

const recommendationsSlice = createSlice({
  name: "recommendations",
  initialState,
  reducers: {
    clearRecommendations: (state) => {
      state.personalized = [];
      state.personalizedStatus = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      // Personalized recommendations
      .addCase(fetchPersonalized.pending, (state) => {
        state.personalizedStatus = "loading";
      })
      .addCase(fetchPersonalized.fulfilled, (state, action) => {
        state.personalizedStatus = "succeeded";
        state.personalized = action.payload.data;
        state.error = null;
        if (action.payload.meta?.pagination) {
          state.pagination = action.payload.meta.pagination;
        }
      })
      .addCase(fetchPersonalized.rejected, (state, action) => {
        state.personalizedStatus = "failed";
        state.error = action.payload as string;
      })

      // Trending media
      .addCase(fetchTrending.pending, (state) => {
        state.trendingStatus = "loading";
      })
      .addCase(fetchTrending.fulfilled, (state, action) => {
        state.trendingStatus = "succeeded";
        state.trending = action.payload.data;
        if (action.payload.meta?.pagination) {
          state.pagination = action.payload.meta.pagination;
        }
        state.error = null;
      })
      .addCase(fetchTrending.rejected, (state, action) => {
        state.trendingStatus = "failed";
        state.error = action.payload as string;
      })

      // Similar media
      .addCase(fetchSimilar.pending, (state, action) => {
        const mediaId = action.meta.arg;
        state.similarStatus[mediaId] = "loading";
      })
      .addCase(fetchSimilar.fulfilled, (state, action) => {
        const { mediaId, data } = action.payload;
        state.similarStatus[mediaId] = "succeeded";
        state.similar[mediaId] = data;
        state.error = null;
      })
      .addCase(fetchSimilar.rejected, (state, action) => {
        const mediaId = action.meta.arg;
        state.similarStatus[mediaId] = "failed";
        state.error = action.payload as string;
      })

      // User preferences
      .addCase(saveUserPreferences.pending, (state) => {
        state.preferencesStatus = "loading";
      })
      .addCase(saveUserPreferences.fulfilled, (state, action) => {
        state.preferencesStatus = "succeeded";
        state.preferences = action.payload;
        state.error = null;
      })
      .addCase(saveUserPreferences.rejected, (state, action) => {
        state.preferencesStatus = "failed";
        state.error = action.payload as string;
      });
  },
});

export const { clearRecommendations } = recommendationsSlice.actions;

// Selectors
export const selectPersonalizedRecommendations = (state: RootState) =>
  state.recommendations.personalized;
export const selectTrendingMedia = (state: RootState) =>
  state.recommendations.trending;
export const selectSimilarMedia = (mediaId: string) => (state: RootState) =>
  state.recommendations.similar[mediaId] || [];
export const selectUserPreferences = (state: RootState) =>
  state.recommendations.preferences;
export const selectPersonalizedStatus = (state: RootState) =>
  state.recommendations.personalizedStatus;
export const selectTrendingStatus = (state: RootState) =>
  state.recommendations.trendingStatus;
export const selectSimilarStatus = (mediaId: string) => (state: RootState) =>
  state.recommendations.similarStatus[mediaId] || "idle";
export const selectPreferencesStatus = (state: RootState) =>
  state.recommendations.preferencesStatus;
export const selectRecommendationsError = (state: RootState) =>
  state.recommendations.error;
export const selectRecommendationsPagination = (state: RootState) =>
  state.recommendations.pagination;

export default recommendationsSlice.reducer;
