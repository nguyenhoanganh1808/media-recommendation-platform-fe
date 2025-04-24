import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  connectToNotificationsSocket,
} from "@/lib/services/notifications";
import type { RootState } from "@/lib/store";

export enum NotificationType {
  NEW_RECOMMENDATION = "recommendation",
  NEW_FOLLOWER = "follow",
  NEW_RATING = "rating",
  NEW_REVIEW = "review",
  LIST_SHARE = "list_share",
  SYSTEM_NOTIFICATION = "system",
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  message: string;
  isRead: boolean;
  data?: {
    [key: string]: any;
  };
  createdAt: string;
}

interface NotificationsState {
  items: Notification[];
  unreadCount: number;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
  socketConnected: boolean;
}

const initialState: NotificationsState = {
  items: [],
  unreadCount: 0,
  status: "idle",
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  },
  socketConnected: false,
};

// Async thunks
export const getNotifications = createAsyncThunk(
  "notifications/getNotifications",
  async (
    { page = 1, limit = 10 }: { page?: number; limit?: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetchNotifications(page, limit);
      return response;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to fetch notifications"
      );
    }
  }
);

export const readNotification = createAsyncThunk(
  "notifications/readNotification",
  async (notificationId: string, { rejectWithValue }) => {
    try {
      await markNotificationAsRead(notificationId);
      return notificationId;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : "Failed to mark notification as read"
      );
    }
  }
);

export const readAllNotifications = createAsyncThunk(
  "notifications/readAllNotifications",
  async (_, { rejectWithValue }) => {
    try {
      await markAllNotificationsAsRead();
      return true;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : "Failed to mark all notifications as read"
      );
    }
  }
);

export const connectToNotifications = createAsyncThunk(
  "notifications/connectSocket",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const socket = connectToNotificationsSocket();

      // Listen for new notifications
      socket.on("notification", (notification: Notification) => {
        dispatch(addNotification(notification));
      });

      // Listen for read status updates
      socket.on("notification_read", (notificationId: string) => {
        dispatch(updateNotificationReadStatus(notificationId));
      });

      // Listen for unread count updates
      socket.on("unread_count", (count: number) => {
        dispatch(setUnreadCount(count));
      });

      return true;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : "Failed to connect to notifications socket"
      );
    }
  }
);

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    addNotification: (state, action) => {
      state.items.unshift(action.payload);
      if (!action.payload.isRead) {
        state.unreadCount += 1;
      }
    },
    updateNotificationReadStatus: (state, action) => {
      const notification = state.items.find(
        (item) => item.id === action.payload
      );
      if (notification && !notification.isRead) {
        notification.isRead = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    setUnreadCount: (state, action) => {
      state.unreadCount = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get notifications
      .addCase(getNotifications.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getNotifications.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload.data;
        state.unreadCount = action.payload.meta.unreadCount;
        state.pagination = action.payload.meta.pagination;
        state.error = null;
      })
      .addCase(getNotifications.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Mark notification as read
      .addCase(readNotification.fulfilled, (state, action) => {
        const notification = state.items.find(
          (item) => item.id === action.payload
        );
        if (notification && !notification.isRead) {
          notification.isRead = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })

      // Mark all notifications as read
      .addCase(readAllNotifications.fulfilled, (state) => {
        state.items.forEach((item) => {
          item.isRead = true;
        });
        state.unreadCount = 0;
      })

      // Connect to socket
      .addCase(connectToNotifications.fulfilled, (state) => {
        state.socketConnected = true;
      })
      .addCase(connectToNotifications.rejected, (state) => {
        state.socketConnected = false;
      });
  },
});

export const { addNotification, updateNotificationReadStatus, setUnreadCount } =
  notificationsSlice.actions;

// Selectors
export const selectAllNotifications = (state: RootState) =>
  state.notifications.items;
export const selectUnreadCount = (state: RootState) =>
  state.notifications.unreadCount;
export const selectNotificationsStatus = (state: RootState) =>
  state.notifications.status;
export const selectNotificationsError = (state: RootState) =>
  state.notifications.error;
export const selectNotificationsPagination = (state: RootState) =>
  state.notifications.pagination;
export const selectSocketConnected = (state: RootState) =>
  state.notifications.socketConnected;

export default notificationsSlice.reducer;
