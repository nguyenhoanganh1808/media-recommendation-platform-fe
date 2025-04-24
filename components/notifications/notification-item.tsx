"use client";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { readNotification } from "@/lib/features/notifications/notificationsSlice";
import { Button } from "@/components/ui/button";
import { Check, User, Star, MessageSquare, Sparkles, Bell } from "lucide-react";
import Link from "next/link";
import type {
  Notification,
  NotificationType,
} from "@/lib/features/notifications/notificationsSlice";
import type { AppDispatch } from "@/lib/store";

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead?: () => void;
}

export function NotificationItem({
  notification,
  onMarkAsRead,
}: NotificationItemProps) {
  const [isMarking, setIsMarking] = useState(false);
  const dispatch = useDispatch<AppDispatch>();

  // Format the timestamp to a relative time (e.g., "2 hours ago")
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return "just now";
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} ${days === 1 ? "day" : "days"} ago`;
    }
  };

  // Get the appropriate icon based on notification type
  const getNotificationIcon = () => {
    switch (notification.type) {
      case "follow":
        return <User className="h-4 w-4" />;
      case "rating":
        return <Star className="h-4 w-4" />;
      case "review":
        return <MessageSquare className="h-4 w-4" />;
      case "recommendation":
        return <Sparkles className="h-4 w-4" />;
      case "system":
        return <Bell className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  // Get the appropriate link based on notification type
  const getNotificationLink = () => {
    switch (notification.type) {
      case "follow":
        return notification.data?.userId
          ? `/users/${notification.data.userId}`
          : "#";
      case "rating":
      case "review":
      case "recommendation":
        return notification.data?.mediaId
          ? `/media/${notification.data.mediaId}`
          : "#";
      default:
        return "#";
    }
  };

  const handleMarkAsRead = async () => {
    if (notification.isRead) return;

    setIsMarking(true);
    try {
      await dispatch(readNotification(notification.id)).unwrap();
      if (onMarkAsRead) onMarkAsRead();
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    } finally {
      setIsMarking(false);
    }
  };

  return (
    <div
      className={`p-4 border-b last:border-b-0 ${notification.isRead ? "bg-background" : "bg-muted/30"}`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`p-2 rounded-full ${getIconBackground(notification.type)}`}
        >
          {getNotificationIcon()}
        </div>

        <div className="flex-1 min-w-0">
          <Link
            href={getNotificationLink()}
            className="block hover:underline"
            onClick={handleMarkAsRead}
          >
            <p className="text-sm">{notification.message}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {formatRelativeTime(notification.createdAt)}
            </p>
          </Link>
        </div>

        {!notification.isRead && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={handleMarkAsRead}
            disabled={isMarking}
          >
            <Check className="h-4 w-4" />
            <span className="sr-only">Mark as read</span>
          </Button>
        )}
      </div>
    </div>
  );
}

// Helper function to get icon background color based on notification type
function getIconBackground(type: NotificationType): string {
  switch (type) {
    case "follow":
      return "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300";
    case "rating":
      return "bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300";
    case "review":
      return "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300";
    case "recommendation":
      return "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300";
    case "system":
      return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300";
    default:
      return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300";
  }
}
