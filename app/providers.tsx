"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { Provider } from "react-redux";
import { store } from "@/lib/store";
import { NotificationToast } from "@/components/notifications/notification-toast";

export function Providers({ children }: { children: React.ReactNode }) {
  // This prevents hydration errors when localStorage is accessed
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <Provider store={store}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        {isClient ? children : null}
        <NotificationToast />
      </ThemeProvider>
    </Provider>
  );
}
