import type { Notification } from "@/lib/features/notifications/notificationsSlice";
import { io, type Socket } from "socket.io-client";
import { api } from "./api";
import axios from "axios";
import { getAuthFromStorage } from "../utils/storage";

interface NotificationsResponse {
  data: Notification[];
  meta: {
    unreadCount: number;
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  };
}

// Fetch notifications
export const fetchNotifications = async (
  page = 1,
  limit = 10
): Promise<NotificationsResponse> => {
  try {
    const response = await api.get(
      `/notifications?page=${page}&limit=${limit}`
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch notifications"
      );
    }
    throw error;
  }
};

// Mark notification as read
export const markNotificationAsRead = async (
  notificationId: string
): Promise<void> => {
  try {
    await api.patch(`/notifications/${notificationId}/read`);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Failed to mark notification as read"
      );
    }
    throw error;
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (): Promise<void> => {
  try {
    await api.patch("/notifications/read-all");
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ||
          "Failed to mark all notifications as read"
      );
    }
    throw error;
  }
};

// WebSocket connection for real-time notifications
let socket: Socket | null = null;

export const connectToNotificationsSocket = (): Socket => {
  if (!socket) {
    socket = io(
      process.env.NEXT_PUBLIC_SOCKET_URL || "https://api.example.com",
      {
        withCredentials: true,
        auth: {
          token: getAuthFromStorage().accessToken,
        },
      }
    );
  }

  return socket;
};
