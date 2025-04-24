import axios from "axios";
import type { UserProfile, UserItem } from "@/lib/features/users/userSlice";
import { api } from "./api";

// Fetch user profile
export const fetchUserProfile = async (
  userId: string
): Promise<UserProfile> => {
  try {
    const response = await api.get(`/users/${userId}`);
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch user profile"
      );
    }
    throw error;
  }
};

// Fetch user followers
export const fetchUserFollowers = async (
  userId: string
): Promise<UserItem[]> => {
  try {
    const response = await api.get(`/users/${userId}/followers`);
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch followers"
      );
    }
    throw error;
  }
};

// Fetch users the user is following
export const fetchUserFollowing = async (
  userId: string
): Promise<UserItem[]> => {
  try {
    const response = await api.get(`/users/${userId}/following`);
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch following"
      );
    }
    throw error;
  }
};

// Follow a user
export const followUser = async (userId: string): Promise<void> => {
  try {
    await api.post(`/users/${userId}/follow`);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Failed to follow user");
    }
    throw error;
  }
};

// Unfollow a user
export const unfollowUser = async (userId: string): Promise<void> => {
  try {
    await api.delete(`/users/${userId}/follow`);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Failed to unfollow user"
      );
    }
    throw error;
  }
};
