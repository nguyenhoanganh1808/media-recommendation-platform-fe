// lib/services/setupApiInterceptors.ts
import type { AxiosInstance } from "axios";
import { getAuthFromStorage } from "@/lib/utils/storage";
import { AppDispatch, RootState } from "../store";

type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export const setupApiInterceptors = (
  api: AxiosInstance,
  getState: () => RootState,
  dispatch: AppDispatch,
  refreshAuthToken: (token: string) => Promise<{ data: AuthTokens }>,
  logoutAction: () => { type: string },
  refreshTokenAction: (tokens: AuthTokens) => {
    type: string;
    payload: AuthTokens;
  }
) => {
  // Request interceptor
  api.interceptors.request.use(
    (config) => {
      // First try to get token from Redux store
      let token = getState().auth.accessToken;

      // If not available in store, try localStorage
      if (!token) {
        const storedAuth = getAuthFromStorage();
        token = storedAuth.accessToken;
      }

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor
  api.interceptors.response.use(
    (response) => {
      return response;
    },
    async (error) => {
      const originalRequest = error.config;

      // If the error is 401 and we haven't retried yet
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          // First try to get refresh token from Redux store
          let refreshTokenValue = getState().auth.refreshToken;

          // If not available in store, try localStorage
          if (!refreshTokenValue) {
            const storedAuth = getAuthFromStorage();
            refreshTokenValue = storedAuth.refreshToken;
          }

          if (!refreshTokenValue) {
            dispatch(logoutAction());
            return Promise.reject(error);
          }

          // Get new tokens
          const { data } = await refreshAuthToken(refreshTokenValue);

          // Update store with new tokens
          dispatch(refreshTokenAction(data));

          // Update the request with the new token
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;

          // Retry the request
          return api(originalRequest);
        } catch (refreshError) {
          // If refresh token fails, logout user
          dispatch(logoutAction());
          return Promise.reject(refreshError);
        }
      }

      // Handle rate limiting
      if (error.response?.status === 429) {
        const retryAfter = error.response.headers["retry-after"] || 1;
        return new Promise((resolve) => {
          setTimeout(() => resolve(api(originalRequest)), retryAfter * 1000);
        });
      }

      return Promise.reject(error);
    }
  );
};
