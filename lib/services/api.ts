// lib/services/api.ts
import { apiClient } from "./apiClient";
import { setupApiInterceptors } from "./setupApiInterceptors";
import { refreshAuthToken } from "./auth";

// Export the basic client at this point
export const api = apiClient;

// Function to initialize interceptors with store
export const initializeApi = (store: any) => {
  setupApiInterceptors(
    apiClient,
    store.getState,
    store.dispatch,
    refreshAuthToken,
    () => ({ type: "auth/logout" }), // Use action type directly to avoid importing
    (tokens) => ({ type: "auth/refreshToken", payload: tokens })
  );
};
