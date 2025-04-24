"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  selectUnreadCount,
  selectSocketConnected,
  connectToNotifications,
} from "@/lib/features/notifications/notificationsSlice";
import type { AppDispatch } from "@/lib/store";

interface NotificationBadgeProps {
  className?: string;
}

export function NotificationBadge({ className }: NotificationBadgeProps) {
  const dispatch = useDispatch<AppDispatch>();
  const unreadCount = useSelector(selectUnreadCount);
  const socketConnected = useSelector(selectSocketConnected);

  // Connect to WebSocket when component mounts
  useEffect(() => {
    if (!socketConnected) {
      dispatch(connectToNotifications());
    }

    // Clean up WebSocket connection when component unmounts
    return () => {
      // dispatch(disconnectFromNotifications())
    };
  }, [dispatch, socketConnected]);

  if (unreadCount === 0) return null;

  return (
    <div
      className={`absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 ${className}`}
    >
      {unreadCount > 99 ? "99+" : unreadCount}
    </div>
  );
}
