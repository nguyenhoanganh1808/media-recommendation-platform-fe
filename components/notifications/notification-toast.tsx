"use client";

import { useEffect } from "react";
import { useSelector } from "react-redux";
import { selectAllNotifications } from "@/lib/features/notifications/notificationsSlice";
import { Bell } from "lucide-react";
import { toast } from "sonner";

export function NotificationToast() {
  const notifications = useSelector(selectAllNotifications);

  // Show toast when a new notification arrives
  useEffect(() => {
    if (notifications.length > 0) {
      const latestNotification = notifications[0];

      // Only show toast for new notifications (less than 5 seconds old)
      const notificationTime = new Date(latestNotification.createdAt).getTime();
      const currentTime = new Date().getTime();
      const timeDiff = currentTime - notificationTime;

      if (timeDiff < 5000) {
        toast.info("New Notification", {
          description: latestNotification.message,
          icon: <Bell className="h-4 w-4" />,
        });
      }
    }
  }, [notifications, toast]);

  // This component doesn't render anything
  return null;
}
