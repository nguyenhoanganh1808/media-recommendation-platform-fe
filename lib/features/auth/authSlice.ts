import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import {
  saveAuthToStorage,
  clearAuthFromStorage,
  getAuthFromStorage,
  updateAccessTokenInStorage,
  updateRefreshTokenInStorage,
  updateUserInStorage,
} from "@/lib/utils/storage";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  username?: string;
  avatar?: string;
  createdAt?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
}

// Initialize state from localStorage
const storedAuth =
  typeof window !== "undefined"
    ? getAuthFromStorage()
    : { accessToken: null, refreshToken: null, user: null };

const initialState: AuthState = {
  isAuthenticated: !!storedAuth.accessToken,
  user: storedAuth.user,
  accessToken: storedAuth.accessToken,
  refreshToken: storedAuth.refreshToken,
};

interface LoginPayload {
  user: User;
  accessToken: string;
  refreshToken: string;
}

interface RefreshTokenPayload {
  accessToken: string;
  refreshToken: string;
}

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action: PayloadAction<LoginPayload>) => {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;

      // Save to localStorage
      saveAuthToStorage(
        action.payload.accessToken,
        action.payload.refreshToken,
        action.payload.user
      );
    },
    refreshToken: (state, action: PayloadAction<RefreshTokenPayload>) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;

      // Update tokens in localStorage
      updateAccessTokenInStorage(action.payload.accessToken);
      updateRefreshTokenInStorage(action.payload.refreshToken);
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;

      // Clear localStorage
      clearAuthFromStorage();
    },
    updateUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;

      // Update user in localStorage
      updateUserInStorage(action.payload);
    },
  },
});

export const { login, refreshToken, logout, updateUser } = authSlice.actions;

export default authSlice.reducer;
