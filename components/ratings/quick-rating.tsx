"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getUserRating,
  selectUserRating,
  selectRatingStatus,
} from "@/lib/features/ratings/ratingsSlice";
import { Star } from "lucide-react";
import type { AppDispatch } from "@/lib/store";

interface QuickRatingProps {
  mediaId: string;
  className?: string;
}

export function QuickRating({ mediaId, className }: QuickRatingProps) {
  const dispatch = useDispatch<AppDispatch>();
  const userRating = useSelector(selectUserRating(mediaId));
  const status = useSelector(selectRatingStatus(mediaId));

  useEffect(() => {
    if (status === "idle") {
      dispatch(getUserRating(mediaId));
    }
  }, [dispatch, mediaId, status]);

  if (!userRating) return null;

  return (
    <div className={`flex items-center text-yellow-500 ${className}`}>
      <Star className="h-3 w-3 fill-current" />
      <span className="ml-1 text-xs font-medium">{userRating.rating}</span>
    </div>
  );
}
