import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  submitRating,
  fetchUserRating,
  deleteRating,
  submitReview,
  fetchReviews,
  fetchUserReview,
  deleteReview,
  likeReview,
  unlikeReview,
} from "@/lib/services/ratings";
import type { RootState } from "@/lib/store";

export interface RatingResponse {
  data: Rating;
}

export interface Rating {
  id: string;
  userId: string;
  mediaId: string;
  rating: number;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  userId: string;
  mediaId: string;
  content: string;
  containsSpoilers: boolean;
  isPublic: boolean;
  likesCount: number;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    username: string;
    avatar: string;
  };
}

export interface ReviewsParams {
  mediaId: string;
  page?: number;
  limit?: number;
  sortBy?: "newest" | "oldest" | "highestRated" | "lowestRated" | "mostHelpful";
  filterRated?: boolean;
  hideSpoilers?: boolean;
}

interface RatingsState {
  userRatings: Record<string, Rating | null>;
  userReviews: Record<string, Review | null>;
  mediaReviews: Record<string, Review[]>;
  ratingStatus: Record<string, "idle" | "loading" | "succeeded" | "failed">;
  reviewStatus: Record<string, "idle" | "loading" | "succeeded" | "failed">;
  mediaReviewsStatus: Record<
    string,
    "idle" | "loading" | "succeeded" | "failed"
  >;
  error: string | null;
  pagination: Record<
    string,
    {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    }
  >;
}

const initialState: RatingsState = {
  userRatings: {},
  userReviews: {},
  mediaReviews: {},
  ratingStatus: {},
  reviewStatus: {},
  mediaReviewsStatus: {},
  error: null,
  pagination: {},
};

// Async thunks for ratings
export const submitUserRating = createAsyncThunk(
  "ratings/submitRating",
  async (
    { mediaId, rating }: { mediaId: string; rating: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await submitRating(mediaId, rating);
      return response;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to submit rating"
      );
    }
  }
);

export const getUserRating = createAsyncThunk(
  "ratings/getUserRating",
  async (mediaId: string, { rejectWithValue }) => {
    try {
      const response = await fetchUserRating(mediaId);
      console.log("response: ", response);
      return { mediaId, rating: response.data };
    } catch (error) {
      if ((error as Error).message.includes("not found")) {
        return { mediaId, rating: null };
      }
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to fetch user rating"
      );
    }
  }
);

export const removeUserRating = createAsyncThunk(
  "ratings/removeRating",
  async (mediaId: string, { rejectWithValue }) => {
    try {
      await deleteRating(mediaId);
      return mediaId;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to delete rating"
      );
    }
  }
);

// Async thunks for reviews
export const submitUserReview = createAsyncThunk(
  "ratings/submitReview",
  async (
    {
      mediaId,
      content,
      containsSpoilers,
      isPublic,
    }: {
      mediaId: string;
      content: string;
      containsSpoilers: boolean;
      isPublic: boolean;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await submitReview(
        mediaId,
        content,
        containsSpoilers,
        isPublic
      );
      return response;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to submit review"
      );
    }
  }
);

export const getUserReview = createAsyncThunk(
  "ratings/getUserReview",
  async (mediaId: string, { rejectWithValue }) => {
    try {
      const response = await fetchUserReview(mediaId);
      return { mediaId, review: response.data };
    } catch (error) {
      if ((error as Error).message.includes("not found")) {
        return { mediaId, review: null };
      }
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to fetch user review"
      );
    }
  }
);

export const getMediaReviews = createAsyncThunk(
  "ratings/getMediaReviews",
  async (params: ReviewsParams, { rejectWithValue }) => {
    try {
      const response = await fetchReviews(params);
      return {
        mediaId: params.mediaId,
        reviews: response.data,
        pagination: response.meta.pagination,
      };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to fetch reviews"
      );
    }
  }
);

export const removeUserReview = createAsyncThunk(
  "ratings/removeReview",
  async (
    { mediaId, reviewId }: { mediaId: string; reviewId: string },
    { rejectWithValue }
  ) => {
    try {
      await deleteReview(reviewId);
      return { mediaId, reviewId };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to delete review"
      );
    }
  }
);

export const likeUserReview = createAsyncThunk(
  "ratings/likeReview",
  async (
    { mediaId, reviewId }: { mediaId: string; reviewId: string },
    { rejectWithValue }
  ) => {
    try {
      await likeReview(reviewId);
      return { mediaId, reviewId };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to like review"
      );
    }
  }
);

export const unlikeUserReview = createAsyncThunk(
  "ratings/unlikeReview",
  async (
    { mediaId, reviewId }: { mediaId: string; reviewId: string },
    { rejectWithValue }
  ) => {
    try {
      await unlikeReview(reviewId);
      return { mediaId, reviewId };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to unlike review"
      );
    }
  }
);

const ratingsSlice = createSlice({
  name: "ratings",
  initialState,
  reducers: {
    clearRatingState: (state, action) => {
      const mediaId = action.payload;
      state.ratingStatus[mediaId] = "idle";
      state.reviewStatus[mediaId] = "idle";
      state.mediaReviewsStatus[mediaId] = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      // Submit rating
      .addCase(submitUserRating.pending, (state, action) => {
        const mediaId = action.meta.arg.mediaId;
        state.ratingStatus[mediaId] = "loading";
      })
      .addCase(submitUserRating.fulfilled, (state, action) => {
        const mediaId = action.meta.arg.mediaId;
        state.ratingStatus[mediaId] = "succeeded";
        state.userRatings[mediaId] = action.payload.data;
        state.error = null;
      })
      .addCase(submitUserRating.rejected, (state, action) => {
        const mediaId = action.meta.arg.mediaId;
        state.ratingStatus[mediaId] = "failed";
        state.error = action.payload as string;
      })

      // Get user rating
      .addCase(getUserRating.pending, (state, action) => {
        const mediaId = action.meta.arg;
        state.ratingStatus[mediaId] = "loading";
      })
      .addCase(getUserRating.fulfilled, (state, action) => {
        const { mediaId, rating } = action.payload;
        state.ratingStatus[mediaId] = "succeeded";
        state.userRatings[mediaId] = rating;
        state.error = null;
      })
      .addCase(getUserRating.rejected, (state, action) => {
        const mediaId = action.meta.arg;
        state.ratingStatus[mediaId] = "failed";
        state.error = action.payload as string;
      })

      // Remove rating
      .addCase(removeUserRating.pending, (state, action) => {
        const mediaId = action.meta.arg;
        state.ratingStatus[mediaId] = "loading";
      })
      .addCase(removeUserRating.fulfilled, (state, action) => {
        const mediaId = action.payload;
        state.ratingStatus[mediaId] = "succeeded";
        state.userRatings[mediaId] = null;
        state.error = null;
      })
      .addCase(removeUserRating.rejected, (state, action) => {
        const mediaId = action.meta.arg;
        state.ratingStatus[mediaId] = "failed";
        state.error = action.payload as string;
      })

      // Submit review
      .addCase(submitUserReview.pending, (state, action) => {
        const mediaId = action.meta.arg.mediaId;
        state.reviewStatus[mediaId] = "loading";
      })
      .addCase(submitUserReview.fulfilled, (state, action) => {
        const mediaId = action.meta.arg.mediaId;
        state.reviewStatus[mediaId] = "succeeded";
        state.userReviews[mediaId] = action.payload.data;

        // Update in media reviews if exists
        if (state.mediaReviews[mediaId]) {
          const existingIndex = state.mediaReviews[mediaId].findIndex(
            (review) => review.userId === action.payload.data.userId
          );

          if (existingIndex >= 0) {
            state.mediaReviews[mediaId][existingIndex] = action.payload.data;
          } else {
            state.mediaReviews[mediaId].unshift(action.payload.data);
          }
        }

        state.error = null;
      })
      .addCase(submitUserReview.rejected, (state, action) => {
        const mediaId = action.meta.arg.mediaId;
        state.reviewStatus[mediaId] = "failed";
        state.error = action.payload as string;
      })

      // Get user review
      .addCase(getUserReview.pending, (state, action) => {
        const mediaId = action.meta.arg;
        state.reviewStatus[mediaId] = "loading";
      })
      .addCase(getUserReview.fulfilled, (state, action) => {
        const { mediaId, review } = action.payload;
        state.reviewStatus[mediaId] = "succeeded";
        state.userReviews[mediaId] = review;
        state.error = null;
      })
      .addCase(getUserReview.rejected, (state, action) => {
        const mediaId = action.meta.arg;
        state.reviewStatus[mediaId] = "failed";
        state.error = action.payload as string;
      })

      // Get media reviews
      .addCase(getMediaReviews.pending, (state, action) => {
        const mediaId = action.meta.arg.mediaId;
        state.mediaReviewsStatus[mediaId] = "loading";
      })
      .addCase(getMediaReviews.fulfilled, (state, action) => {
        const { mediaId, reviews, pagination } = action.payload;
        state.mediaReviewsStatus[mediaId] = "succeeded";
        state.mediaReviews[mediaId] = reviews;
        state.pagination[mediaId] = pagination;
        state.error = null;
      })
      .addCase(getMediaReviews.rejected, (state, action) => {
        const mediaId = action.meta.arg.mediaId;
        state.mediaReviewsStatus[mediaId] = "failed";
        state.error = action.payload as string;
      })

      // Remove review
      .addCase(removeUserReview.pending, (state) => {
        // We don't need to update status here as it's handled by the component
      })
      .addCase(removeUserReview.fulfilled, (state, action) => {
        const { mediaId, reviewId } = action.payload;
        state.userReviews[mediaId] = null;

        // Remove from media reviews if exists
        if (state.mediaReviews[mediaId]) {
          state.mediaReviews[mediaId] = state.mediaReviews[mediaId].filter(
            (review) => review.id !== reviewId
          );
        }

        state.error = null;
      })
      .addCase(removeUserReview.rejected, (state, action) => {
        state.error = action.payload as string;
      })

      // Like review
      .addCase(likeUserReview.fulfilled, (state, action) => {
        const { mediaId, reviewId } = action.payload;

        // Update in media reviews if exists
        if (state.mediaReviews[mediaId]) {
          const reviewIndex = state.mediaReviews[mediaId].findIndex(
            (review) => review.id === reviewId
          );

          if (reviewIndex >= 0) {
            state.mediaReviews[mediaId][reviewIndex].likesCount += 1;
            // state.mediaReviews[mediaId][reviewIndex].isLikedByUser = true;
          }
        }

        // Update in user review if it's the same review
        if (
          state.userReviews[mediaId] &&
          state.userReviews[mediaId]?.id === reviewId
        ) {
          state.userReviews[mediaId]!.likesCount += 1;
          // state.userReviews[mediaId]!.isLikedByUser = true;
        }

        state.error = null;
      })

      // Unlike review
      .addCase(unlikeUserReview.fulfilled, (state, action) => {
        const { mediaId, reviewId } = action.payload;

        // Update in media reviews if exists
        if (state.mediaReviews[mediaId]) {
          const reviewIndex = state.mediaReviews[mediaId].findIndex(
            (review) => review.id === reviewId
          );

          if (reviewIndex >= 0) {
            state.mediaReviews[mediaId][reviewIndex].likesCount -= 1;
            // state.mediaReviews[mediaId][reviewIndex].isLikedByUser = false;
          }
        }

        // Update in user review if it's the same review
        if (
          state.userReviews[mediaId] &&
          state.userReviews[mediaId]?.id === reviewId
        ) {
          state.userReviews[mediaId]!.likesCount -= 1;
          // state.userReviews[mediaId]!.isLikedByUser = false;
        }

        state.error = null;
      });
  },
});

export const { clearRatingState } = ratingsSlice.actions;

// Selectors
export const selectUserRating = (mediaId: string) => (state: RootState) =>
  state.ratings.userRatings[mediaId];

export const selectUserReview = (mediaId: string) => (state: RootState) =>
  state.ratings.userReviews[mediaId];

export const selectMediaReviews = (mediaId: string) => (state: RootState) =>
  state.ratings.mediaReviews[mediaId] || [];

export const selectRatingStatus = (mediaId: string) => (state: RootState) =>
  state.ratings.ratingStatus[mediaId] || "idle";

export const selectReviewStatus = (mediaId: string) => (state: RootState) =>
  state.ratings.reviewStatus[mediaId] || "idle";

export const selectMediaReviewsStatus =
  (mediaId: string) => (state: RootState) =>
    state.ratings.mediaReviewsStatus[mediaId] || "idle";

export const selectReviewsPagination =
  (mediaId: string) => (state: RootState) =>
    state.ratings.pagination[mediaId];

export const selectRatingsError = (state: RootState) => state.ratings.error;

export default ratingsSlice.reducer;
