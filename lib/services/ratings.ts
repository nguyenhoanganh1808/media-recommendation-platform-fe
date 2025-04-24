import axios from "axios";
import type {
  Rating,
  RatingResponse,
  Review,
  ReviewsParams,
} from "@/lib/features/ratings/ratingsSlice";
import { api } from "./api";

interface ReviewsResponse {
  data: Review[];
  meta: {
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  };
}

interface ReviewResponse {
  data: Review;
}

// Submit a rating
export const submitRating = async (
  mediaId: string,
  rating: number
): Promise<RatingResponse> => {
  try {
    // In a real app, this would be:
    const response = await api.post("/ratings", { mediaId, rating });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Failed to submit rating"
      );
    }
    throw error;
  }
};

// Fetch user's rating for a media
export const fetchUserRating = async (
  mediaId: string
): Promise<RatingResponse> => {
  try {
    const response = await api.get(`/ratings/user/media/${mediaId}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch user rating"
      );
    }
    throw error;
  }
};

// Delete a rating
export const deleteRating = async (mediaId: string): Promise<void> => {
  try {
    await api.delete(`/ratings?mediaId=${mediaId}`);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Failed to delete rating"
      );
    }
    throw error;
  }
};

// Submit a review
export const submitReview = async (
  mediaId: string,
  content: string,
  containsSpoilers: boolean,
  isPublic: boolean
): Promise<ReviewResponse> => {
  try {
    const response = await api.post("/reviews", {
      mediaId,
      content,
      containsSpoilers,
      isVisible: isPublic,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Failed to submit review"
      );
    }
    throw error;
  }
};

// Fetch user's review for a media
export const fetchUserReview = async (
  mediaId: string
): Promise<ReviewResponse> => {
  try {
    // In a real app, this would be:
    const response = await api.get(`/reviews/user?mediaId=${mediaId}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch user review"
      );
    }
    throw error;
  }
};

// Fetch reviews for a media
export const fetchReviews = async (
  params: ReviewsParams
): Promise<ReviewsResponse> => {
  try {
    const response = await api.get(`/reviews/media/${params.mediaId}`, {
      params,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch reviews"
      );
    }
    throw error;
  }
};

// Delete a review
export const deleteReview = async (reviewId: string): Promise<void> => {
  try {
    await api.delete(`/reviews/${reviewId}`);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Failed to delete review"
      );
    }
    throw error;
  }
};

// Like a review
export const likeReview = async (reviewId: string): Promise<void> => {
  try {
    await api.post(`/api/reviews/${reviewId}/like`);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Failed to like review");
    }
    throw error;
  }
};

// Unlike a review
export const unlikeReview = async (reviewId: string): Promise<void> => {
  try {
    await api.delete(`/api/reviews/${reviewId}/like`);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Failed to unlike review"
      );
    }
    throw error;
  }
};
