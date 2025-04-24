"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  followUser,
  unfollowUser,
  selectFollowStatus,
} from "@/lib/features/users/userSlice";
import { Button } from "@/components/ui/button";
import { Loader2, UserPlus, UserMinus } from "lucide-react";
import type { AppDispatch } from "@/lib/store";
import { toast } from "sonner";

interface FollowButtonProps {
  userId: string;
  isFollowing: boolean;
  size?: "default" | "sm" | "lg" | "icon";
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  className?: string;
}

export function FollowButton({
  userId,
  isFollowing,
  size = "default",
  variant = "default",
  className,
}: FollowButtonProps) {
  const dispatch = useDispatch<AppDispatch>();
  const followStatus = useSelector(selectFollowStatus);

  // Local state to handle optimistic UI updates
  const [following, setFollowing] = useState(isFollowing);
  const [isLoading, setIsLoading] = useState(false);

  const handleFollowToggle = async () => {
    setIsLoading(true);

    try {
      // Optimistic update
      setFollowing(!following);

      if (following) {
        await dispatch(unfollowUser(userId)).unwrap();
        toast.success("Unfollowed", {
          description: "You are no longer following this user",
        });
      } else {
        await dispatch(followUser(userId)).unwrap();
        toast.success("Followed", {
          description: "You are now following this user",
        });
      }
    } catch (error) {
      // Revert optimistic update on error
      setFollowing(following);
      toast.error("Error", {
        description:
          error instanceof Error
            ? error.message
            : "Failed to update follow status",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={following ? "outline" : variant}
      size={size}
      onClick={handleFollowToggle}
      disabled={isLoading}
      className={className}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {following ? "Unfollow..." : "Following..."}
        </>
      ) : (
        <>
          {following ? (
            <>
              <UserMinus className="mr-2 h-4 w-4" />
              Unfollow
            </>
          ) : (
            <>
              <UserPlus className="mr-2 h-4 w-4" />
              Follow
            </>
          )}
        </>
      )}
    </Button>
  );
}
