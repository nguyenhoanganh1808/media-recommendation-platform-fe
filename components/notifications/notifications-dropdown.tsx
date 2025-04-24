"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getNotifications,
  readAllNotifications,
  selectAllNotifications,
  selectNotificationsStatus,
  selectNotificationsPagination,
  selectUnreadCount,
} from "@/lib/features/notifications/notificationsSlice";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NotificationBadge } from "./notification-badge";
import { NotificationItem } from "./notification-item";
import { Bell, Loader2 } from "lucide-react";
import type { AppDispatch } from "@/lib/store";

export function NotificationsDropdown() {
  const [open, setOpen] = useState(false);
  const [isMarkingAllRead, setIsMarkingAllRead] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const notifications = useSelector(selectAllNotifications);
  const status = useSelector(selectNotificationsStatus);
  const pagination = useSelector(selectNotificationsPagination);
  const unreadCount = useSelector(selectUnreadCount);

  // Fetch notifications when dropdown is opened
  useEffect(() => {
    if (status === "idle") {
      dispatch(getNotifications({}));
    }
  }, [open, status, dispatch]);

  const handleLoadMore = () => {
    if (pagination.currentPage < pagination.totalPages) {
      dispatch(getNotifications({ page: pagination.currentPage + 1 }));
    }
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) return;

    setIsMarkingAllRead(true);
    try {
      await dispatch(readAllNotifications()).unwrap();
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    } finally {
      setIsMarkingAllRead(false);
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <NotificationBadge />
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[380px]">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-semibold">Notifications</h2>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={isMarkingAllRead}
            >
              {isMarkingAllRead ? (
                <>
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Marking...
                </>
              ) : (
                "Mark all as read"
              )}
            </Button>
          )}
        </div>

        <ScrollArea className="h-[400px]">
          {status === "loading" && notifications.length === 0 ? (
            <div className="p-4 space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-start gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-4 text-center">
              <Bell className="h-12 w-12 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No notifications yet</p>
            </div>
          ) : (
            <>
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                />
              ))}

              {pagination.currentPage < pagination.totalPages && (
                <div className="p-2 text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLoadMore}
                    disabled={status === "loading"}
                  >
                    {status === "loading" ? (
                      <>
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      "Load more"
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
