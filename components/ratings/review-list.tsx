"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getMediaReviews,
  likeUserReview,
  unlikeUserReview,
  selectMediaReviews,
  selectMediaReviewsStatus,
  selectReviewsPagination,
  type ReviewsParams,
} from "@/lib/features/ratings/ratingsSlice";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Pagination } from "@/components/lists/pagination";
import { ThumbsUp, Star, AlertTriangle, Loader2 } from "lucide-react";
import Link from "next/link";
import type { AppDispatch } from "@/lib/store";

interface ReviewListProps {
  mediaId: string;
  className?: string;
}

export function ReviewList({ mediaId, className }: ReviewListProps) {
  const [params, setParams] = useState<ReviewsParams>({
    mediaId,
    page: 1,
    limit: 5,
    sortBy: "newest",
    filterRated: false,
    hideSpoilers: false,
  });
  const [expandedReviews, setExpandedReviews] = useState<
    Record<string, boolean>
  >({});
  const [likeInProgress, setLikeInProgress] = useState<Record<string, boolean>>(
    {}
  );

  const dispatch = useDispatch<AppDispatch>();
  const reviews = useSelector(selectMediaReviews(mediaId));
  const status = useSelector(selectMediaReviewsStatus(mediaId));
  const pagination = useSelector(selectReviewsPagination(mediaId));

  // Fetch reviews when component mounts or params change
  useEffect(() => {
    dispatch(getMediaReviews(params));
  }, [dispatch, params]);

  const handleSortChange = (value: string) => {
    setParams((prev) => ({
      ...prev,
      sortBy: value as ReviewsParams["sortBy"],
      page: 1, // Reset to first page when sorting changes
    }));
  };

  const handleFilterRatedChange = (checked: boolean) => {
    setParams((prev) => ({
      ...prev,
      filterRated: checked,
      page: 1, // Reset to first page when filter changes
    }));
  };

  const handleHideSpoilersChange = (checked: boolean) => {
    setParams((prev) => ({
      ...prev,
      hideSpoilers: checked,
      page: 1, // Reset to first page when filter changes
    }));
  };

  const handlePageChange = (page: number) => {
    setParams((prev) => ({ ...prev, page }));
  };

  const toggleExpandReview = (reviewId: string) => {
    setExpandedReviews((prev) => ({
      ...prev,
      [reviewId]: !prev[reviewId],
    }));
  };

  const handleLikeToggle = async (reviewId: string, isLiked: boolean) => {
    if (likeInProgress[reviewId]) return;

    setLikeInProgress((prev) => ({ ...prev, [reviewId]: true }));

    try {
      if (isLiked) {
        await dispatch(unlikeUserReview({ mediaId, reviewId })).unwrap();
      } else {
        await dispatch(likeUserReview({ mediaId, reviewId })).unwrap();
      }
    } catch (error) {
      toast.error("Error", {
        description:
          error instanceof Error
            ? error.message
            : "Failed to update like status",
      });
    } finally {
      setLikeInProgress((prev) => ({ ...prev, [reviewId]: false }));
    }
  };

  // Loading state
  if (status === "loading" && reviews.length === 0) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Reviews</h2>
          <Skeleton className="h-10 w-32" />
        </div>

        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="border rounded-lg p-4 space-y-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-bold">Reviews</h2>

        <div className="flex flex-wrap gap-4 items-center">
          <Select value={params.sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="highestRated">Highest Rated</SelectItem>
              <SelectItem value="lowestRated">Lowest Rated</SelectItem>
              <SelectItem value="mostHelpful">Most Helpful</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center space-x-2">
            <Switch
              id="filter-rated"
              checked={params.filterRated}
              onCheckedChange={handleFilterRatedChange}
            />
            <Label htmlFor="filter-rated" className="text-sm">
              Show only with ratings
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="hide-spoilers"
              checked={params.hideSpoilers}
              onCheckedChange={handleHideSpoilersChange}
            />
            <Label htmlFor="hide-spoilers" className="text-sm">
              Hide spoilers
            </Label>
          </div>
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-8 border rounded-lg">
          <p className="text-muted-foreground">No reviews found.</p>
          <p className="text-sm text-muted-foreground mt-1">
            Be the first to review this media!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => {
            const isExpanded = expandedReviews[review.id] || false;
            const isLongContent = review.content.length > 300;
            const displayContent =
              isLongContent && !isExpanded
                ? `${review.content.substring(0, 300)}...`
                : review.content;

            return (
              <div key={review.id} className="border rounded-lg p-4 space-y-4">
                <div className="flex justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage
                        src={review.user.avatar}
                        alt={review.user.firstName}
                      />
                      <AvatarFallback>
                        {review.user.firstName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <Link
                        href={`/users/${review.user.id}`}
                        className="font-medium hover:underline"
                      >
                        {review.user.firstName}
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        @{review.user.username}
                      </p>
                    </div>
                  </div>
                  {/* 
                  {review.rating && (
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
                      <span className="font-medium">{review.rating.score}/10</span>
                    </div>
                  )} */}
                </div>

                {review.containsSpoilers && (
                  <div className="bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 p-2 rounded flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      Contains Spoilers
                    </span>
                  </div>
                )}

                <div className="whitespace-pre-line">
                  {displayContent}

                  {isLongContent && (
                    <Button
                      variant="link"
                      className="px-0 h-auto"
                      onClick={() => toggleExpandReview(review.id)}
                    >
                      {isExpanded ? "Show less" : "Read more"}
                    </Button>
                  )}
                </div>

                <div className="flex justify-between items-center text-sm text-muted-foreground">
                  <div>
                    {new Date(review.createdAt).toLocaleDateString()}
                    {review.updatedAt !== review.createdAt &&
                      ` (Updated: ${new Date(review.updatedAt).toLocaleDateString()})`}
                  </div>

                  {/* <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-1"
                    onClick={() => handleLikeToggle(review.id, review.isLikedByUser)}
                    disabled={!!likeInProgress[review.id]}
                  >
                    {likeInProgress[review.id] ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ThumbsUp className={`h-4 w-4 ${review.isLikedByUser ? "fill-current" : ""}`} />
                    )}
                    <span>{review.likesCount}</span>
                  </Button> */}
                </div>
              </div>
            );
          })}

          {pagination && pagination.totalPages > 1 && (
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      )}
    </div>
  );
}
