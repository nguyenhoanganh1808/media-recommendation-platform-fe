import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./features/auth/authSlice";
import mediaReducer from "./features/media/mediaSlice";
import userReducer from "./features/users/userSlice";
import listsReducer from "./features/lists/listsSlice";
import recommendationsReducer from "./features/recommendations/recommendationsSlice";
import genresReducer from "./features/genres/genresSlice";
import ratingsReducer from "./features/ratings/ratingsSlice";
import notificationReducer from "./features/notifications/notificationsSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    media: mediaReducer,
    users: userReducer,
    lists: listsReducer,
    recommendations: recommendationsReducer,
    genres: genresReducer,
    ratings: ratingsReducer,
    notifications: notificationReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ["auth/login", "auth/refreshToken"],
        // Ignore these field paths in all actions
        ignoredActionPaths: ["payload.refreshToken"],
        // Ignore these paths in the state
        ignoredPaths: ["auth.refreshToken"],
      },
    }),
});

// Initialize API interceptors after store creation
import { initializeApi } from "./services/api";
initializeApi(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;
