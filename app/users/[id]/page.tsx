"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchProfile,
  fetchFollowers,
  fetchFollowing,
  selectUserProfile,
  selectFollowers,
  selectFollowing,
  selectProfileStatus,
  selectFollowersStatus,
  selectFollowingStatus,
  clearUserProfile,
} from "@/lib/features/users/userSlice";
import type { RootState, AppDispatch } from "@/lib/store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Calendar, Mail, Edit } from "lucide-react";
import { FollowButton } from "@/components/users/follow-button";
import { UserStats } from "@/components/users/user-stats";

export default function UserProfilePage() {
  const params = useParams();
  const userId = params.id as string;
  const dispatch = useDispatch<AppDispatch>();

  const profile = useSelector(selectUserProfile);
  const followers = useSelector(selectFollowers);
  const following = useSelector(selectFollowing);
  const profileStatus = useSelector(selectProfileStatus);
  const followersStatus = useSelector(selectFollowersStatus);
  const followingStatus = useSelector(selectFollowingStatus);
  const currentUser = useSelector((state: RootState) => state.auth.user);

  const isCurrentUser = currentUser?.id === userId;

  // Fetch user profile and social data
  useEffect(() => {
    dispatch(fetchProfile(userId));
    dispatch(fetchFollowers(userId));
    dispatch(fetchFollowing(userId));

    // Cleanup on unmount
    return () => {
      dispatch(clearUserProfile());
    };
  }, [dispatch, userId]);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Loading state
  if (profileStatus === "loading" && !profile) {
    return (
      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/3">
              <Skeleton className="h-40 w-40 rounded-full mx-auto" />
              <div className="mt-4 space-y-2">
                <Skeleton className="h-8 w-3/4 mx-auto" />
                <Skeleton className="h-6 w-1/2 mx-auto" />
                <Skeleton className="h-10 w-full mt-4" />
              </div>
            </div>
            <div className="md:w-2/3 space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (profileStatus === "failed") {
    return (
      <div className="container py-8">
        <Alert variant="destructive" className="max-w-4xl mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load user profile. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // No profile found
  if (!profile) {
    return (
      <div className="container py-8">
        <div className="max-w-4xl mx-auto text-center py-12">
          <h2 className="text-2xl font-bold mb-2">User Not Found</h2>
          <p className="text-muted-foreground">
            The requested user could not be found.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Profile sidebar */}
          <div className="md:w-1/3">
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-40 w-40">
                <AvatarImage src={profile.avatar} alt={profile.firstName} />
                <AvatarFallback>{profile.firstName.charAt(0)}</AvatarFallback>
              </Avatar>

              <h1 className="text-2xl font-bold mt-4">
                {profile.firstName} {profile.lastName}
              </h1>
              <p className="text-muted-foreground">@{profile.username}</p>

              <div className="flex items-center text-sm text-muted-foreground mt-2">
                <Calendar className="h-4 w-4 mr-1" />
                <span>Joined {formatDate(profile.createdAt)}</span>
              </div>

              {profile.email && (
                <div className="flex items-center text-sm text-muted-foreground mt-1">
                  <Mail className="h-4 w-4 mr-1" />
                  <span>{profile.email}</span>
                </div>
              )}

              <div className="w-full mt-4">
                {isCurrentUser ? (
                  <Button className="w-full" variant="outline">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Button>
                ) : (
                  <FollowButton
                    userId={profile.id}
                    isFollowing={profile.isFollowing}
                    className="w-full"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Profile content */}
          <div className="md:w-2/3">
            {/* Bio */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Bio</h2>
              <p className="text-muted-foreground">
                {profile.bio || "This user hasn't added a bio yet."}
              </p>
            </div>

            {/* Stats and social */}
            <UserStats
              profile={profile}
              followers={followers}
              following={following}
              currentUserId={currentUser?.id || null}
              followersLoading={followersStatus === "loading"}
              followingLoading={followingStatus === "loading"}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
