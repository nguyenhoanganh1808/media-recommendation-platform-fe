"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  submitUserReview,
  getUserReview,
  selectUserReview,
  selectReviewStatus,
} from "@/lib/features/ratings/ratingsSlice";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import type { AppDispatch } from "@/lib/store";
import { toast } from "sonner";

interface ReviewFormProps {
  mediaId: string;
  onSuccess?: () => void;
  className?: string;
}

export function ReviewForm({ mediaId, onSuccess, className }: ReviewFormProps) {
  const [content, setContent] = useState("");
  const [containsSpoilers, setContainsSpoilers] = useState(false);
  const [isPublic, setIsPublic] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const userReview = useSelector(selectUserReview(mediaId));
  const status = useSelector(selectReviewStatus(mediaId));

  // Fetch user's review when component mounts
  useEffect(() => {
    if (status === "idle") {
      dispatch(getUserReview(mediaId));
    }
  }, [dispatch, mediaId, status]);

  // Initialize form with existing review if available
  useEffect(() => {
    if (userReview && !isEditing) {
      setContent(userReview.content);
      setContainsSpoilers(userReview.containsSpoilers);
      setIsPublic(userReview.isPublic);
    }
  }, [userReview, isEditing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      toast.error("Error", {
        description: "Review content cannot be empty",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await dispatch(
        submitUserReview({
          mediaId,
          content,
          containsSpoilers,
          isPublic,
        })
      ).unwrap();

      toast.success(userReview ? "Review Updated" : "Review Submitted", {
        description: userReview
          ? "Your review has been updated successfully."
          : "Your review has been submitted successfully.",
      });

      setIsEditing(false);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast("Error", {
        description:
          error instanceof Error ? error.message : "Failed to submit review",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (userReview) {
      setContent(userReview.content);
      setContainsSpoilers(userReview.containsSpoilers);
      setIsPublic(userReview.isPublic);
    } else {
      setContent("");
      setContainsSpoilers(false);
      setIsPublic(true);
    }
    setIsEditing(false);
  };

  // Loading state
  if (status === "loading" && !userReview) {
    return (
      <div className={`flex items-center justify-center p-4 ${className}`}>
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // View mode (when user has a review and is not editing)
  if (userReview && !isEditing) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="bg-muted/50 p-4 rounded-md">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-medium">Your Review</h3>
              <p className="text-xs text-muted-foreground">
                Posted on {new Date(userReview.createdAt).toLocaleDateString()}
                {userReview.updatedAt !== userReview.createdAt &&
                  ` (Updated on ${new Date(userReview.updatedAt).toLocaleDateString()})`}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={handleEdit}>
              Edit Review
            </Button>
          </div>

          {userReview.containsSpoilers && (
            <div className="bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 p-2 rounded mb-2 text-sm font-medium">
              Contains Spoilers
            </div>
          )}

          <p className="whitespace-pre-line">{userReview.content}</p>

          <div className="mt-2 text-xs text-muted-foreground">
            {userReview.isPublic ? "Public review" : "Private review"}
          </div>
        </div>
      </div>
    );
  }

  // Edit/Create mode
  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      <div className="space-y-2">
        <Label htmlFor="review-content">
          {userReview ? "Edit Your Review" : "Write a Review"}
        </Label>
        <Textarea
          id="review-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share your thoughts about this media..."
          rows={5}
          className="resize-none"
        />
        <div className="text-xs text-muted-foreground text-right">
          {content.length} characters
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="contains-spoilers"
            checked={containsSpoilers}
            onCheckedChange={setContainsSpoilers}
          />
          <Label htmlFor="contains-spoilers">Contains spoilers</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="is-public"
            checked={isPublic}
            onCheckedChange={setIsPublic}
          />
          <Label htmlFor="is-public">Make review public</Label>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        {(userReview || content.trim()) && (
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {userReview ? "Updating..." : "Submitting..."}
            </>
          ) : userReview ? (
            "Update Review"
          ) : (
            "Submit Review"
          )}
        </Button>
      </div>
    </form>
  );
}
