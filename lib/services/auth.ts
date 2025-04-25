import axios from "axios";

import { apiClient } from "./apiClient";

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials {
  name: string;
  email: string;
  username: string;
  password: string;
}

interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      username?: string;
      avatar?: string;
      createdAt?: string;
    };
    accessToken: string;
    refreshToken: string;
  };
}

interface UserProfileResponse {
  data: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    bio: string;
    username?: string;
    avatar?: string;
    createdAt?: string;
  };
}

export const loginUser = async (
  credentials: LoginCredentials
): Promise<AuthResponse> => {
  try {
    const response = await apiClient.post("/auth/login", credentials);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Login failed");
    }
    throw error;
  }
};

export const registerUser = async (
  credentials: RegisterCredentials
): Promise<AuthResponse> => {
  try {
    const response = await apiClient.post("/auth/register", credentials);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Registration failed");
    }
    throw error;
  }
};

export const refreshAuthToken = async (
  refreshToken: string
): Promise<{
  data: { accessToken: string; refreshToken: string };
  message: string;
}> => {
  try {
    const response = await apiClient.post("/auth/refresh-token", {
      refreshToken,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Token refresh failed");
    }
    throw error;
  }
};

export const logoutUser = async (): Promise<void> => {
  try {
    await apiClient.post("/auth/logout");
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Logout failed");
    }
    throw error;
  }
};

export const getUserProfile = async (): Promise<UserProfileResponse> => {
  try {
    const response = await apiClient.get("/auth/profile");
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch user profile"
      );
    }
    throw error;
  }
};
