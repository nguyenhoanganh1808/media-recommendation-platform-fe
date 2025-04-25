"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  submitUserRating,
  getUserRating,
  removeUserRating,
  selectUserRating,
  selectRatingStatus,
} from "@/lib/features/ratings/ratingsSlice";
import { Button } from "@/components/ui/button";
import { Star, Loader2, Trash2 } from "lucide-react";
import type { AppDispatch } from "@/lib/store";
import { toast } from "sonner";

interface StarRatingProps {
  mediaId: string;
  size?: "sm" | "md" | "lg";
  showDelete?: boolean;
  onRatingChange?: (rating: number | null) => void;
  className?: string;
}

export function StarRating({
  mediaId,
  size = "md",
  showDelete = true,
  onRatingChange,
  className,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const userRating = useSelector(selectUserRating(mediaId));
  const status = useSelector(selectRatingStatus(mediaId));

  // Fetch user's rating when component mounts
  useEffect(() => {
    if (status === "idle") {
      dispatch(getUserRating(mediaId));
    }
  }, [dispatch, mediaId, status]);

  // Notify parent component when rating changes
  useEffect(() => {
    if (onRatingChange) {
      onRatingChange(userRating?.rating || null);
    }
  }, [userRating, onRatingChange]);

  const handleRatingClick = async (rating: number) => {
    try {
      // If clicking the same rating, do nothing
      if (userRating?.rating === rating) return;

      // Dispatch the action
      await dispatch(submitUserRating({ mediaId, rating: rating })).unwrap();

      toast.success("Rating Submitted", {
        description: "Your rating has been saved successfully.",
      });
    } catch (error) {
      toast.error("Error", {
        description:
          error instanceof Error ? error.message : "Failed to submit rating",
      });
    }
  };

  const handleDeleteRating = async () => {
    try {
      setIsDeleting(true);
      await dispatch(removeUserRating(mediaId)).unwrap();

      toast.success("Rating Removed", {
        description: "Your rating has been removed successfully.",
      });
    } catch (error) {
      toast.error("Error", {
        description:
          error instanceof Error ? error.message : "Failed to remove rating",
      });
    } finally {
      setIsDeleting(false);
    }
  };
  console.log("userRating: ", userRating);

  // Determine star size based on prop
  const starSize =
    size === "sm" ? "h-4 w-4" : size === "lg" ? "h-8 w-8" : "h-6 w-6";
  const containerClass =
    size === "sm" ? "gap-1" : size === "lg" ? "gap-2" : "gap-1.5";

  // Loading state
  if (status === "loading" && !userRating) {
    return (
      <div className={`flex items-center ${className}`}>
        <Loader2 className={`${starSize} animate-spin text-muted-foreground`} />
      </div>
    );
  }

  return (
    <div className={`flex flex-col ${className}`}>
      <div className={`flex items-center ${containerClass}`}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
          <button
            key={rating}
            type="button"
            onClick={() => handleRatingClick(rating)}
            onMouseEnter={() => setHoverRating(rating)}
            onMouseLeave={() => setHoverRating(null)}
            className="focus:outline-none transition-transform hover:scale-110"
            aria-label={`Rate ${rating} out of 10`}
          >
            <Star
              className={`${starSize} ${
                (
                  hoverRating !== null
                    ? rating <= hoverRating
                    : rating <= (userRating?.rating || 0)
                )
                  ? "text-yellow-500 fill-yellow-500"
                  : "text-gray-300 dark:text-gray-600"
              } transition-colors`}
            />
          </button>
        ))}

        {showDelete && userRating && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDeleteRating}
            disabled={isDeleting}
            className="ml-2"
            aria-label="Remove rating"
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
            )}
          </Button>
        )}
      </div>

      {userRating && (
        <p className="text-sm text-muted-foreground mt-1">
          Your rating:{" "}
          <span className="font-medium">{userRating.rating}/10</span>
        </p>
      )}
    </div>
  );
}
