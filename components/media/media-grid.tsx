"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMediaItems } from "@/lib/features/media/mediaSlice";
import type { RootState, AppDispatch } from "@/lib/store";
import { MediaCard } from "./media-card";
import { MediaCardSkeleton } from "./media-card-skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export function MediaGrid() {
  const dispatch = useDispatch<AppDispatch>();
  const { items, status, error, filters } = useSelector(
    (state: RootState) => state.media
  );

  // Fetch media items when filters change
  useEffect(() => {
    dispatch(fetchMediaItems());
  }, [dispatch, filters]);

  // Loading state
  if (status === "loading" && items.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 12 }).map((_, index) => (
          <MediaCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  // Error state
  if (status === "failed") {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {error || "Failed to load media. Please try again later."}
        </AlertDescription>
      </Alert>
    );
  }

  // Empty state
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <h3 className="text-xl font-semibold mb-2">No results found</h3>
        <p className="text-muted-foreground">
          Try adjusting your search or filter criteria
        </p>
      </div>
    );
  }

  // Success state
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {items.map((item) => (
        <MediaCard key={item.id} media={item} />
      ))}
    </div>
  );
}
