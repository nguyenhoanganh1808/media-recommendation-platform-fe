"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchMediaDetails } from "@/lib/services/media";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft, Star } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/lib/store";
import { AddToListModal } from "@/components/lists/add-to-list-modal";
import { MediaItem } from "@/lib/features/media/mediaSlice";
import { MediaRatingReviews } from "@/components/ratings/media-rating-reviews";
import { SimilarRecommendations } from "@/components/ratings/similar-recommendations";

export default function MediaDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [media, setMedia] = useState<MediaItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const mediaId = params.id as string;

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const data = await fetchMediaDetails(mediaId);
        setMedia(data);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load media details"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [mediaId, dispatch]);

  // Loading state
  if (loading) {
    return (
      <div className="container py-8">
        <Button variant="ghost" className="mb-6" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="flex flex-col md:flex-row gap-8">
          <Skeleton className="w-full md:w-1/3 aspect-[2/3] rounded-lg" />
          <div className="w-full md:w-2/3 space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-4 w-1/4" />
            <div className="flex gap-2 pt-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-16" />
            </div>
            <Skeleton className="h-32 w-full mt-4" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container py-8">
        <Button variant="ghost" className="mb-6" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  // No media found
  if (!media) {
    return (
      <div className="container py-8">
        <Button variant="ghost" className="mb-6" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">Media Not Found</h2>
          <p className="text-muted-foreground">
            The requested media could not be found.
          </p>
        </div>
      </div>
    );
  }

  // Get media type badge color
  const getTypeColor = (type: string) => {
    switch (type) {
      case "MOVIE":
        return "bg-blue-500";
      case "GAME":
        return "bg-green-500";
      case "MANGA":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

  // Extract year from release date
  const releaseYear = new Date(media.releaseDate).getFullYear();

  return (
    <div className="container py-8">
      <Button variant="ghost" className="mb-6" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/3">
          <div className="relative aspect-[2/3] overflow-hidden rounded-lg">
            <img
              src={media.coverImage || "/placeholder.svg"}
              alt={media.title}
              className="object-cover w-full h-full"
            />
            <Badge
              className={`absolute top-4 right-4 ${getTypeColor(
                media.mediaType || "ALL"
              )}`}
            >
              {media.mediaType}
            </Badge>
          </div>
        </div>

        <div className="w-full md:w-2/3">
          <h1 className="text-3xl font-bold">{media.title}</h1>

          {media.originalTitle && (
            <p className="text-xl text-muted-foreground mt-1">
              {media.originalTitle}
            </p>
          )}

          <div className="flex items-center mt-4 space-x-4">
            <div className="flex items-center text-yellow-500">
              <Star className="h-5 w-5 fill-current" />
              <span className="ml-1 font-bold">
                {media.averageRating.toFixed(1)}
              </span>
            </div>
            <span>{releaseYear}</span>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            {media.genres.map((genreItem) => (
              <Badge key={genreItem.genreId} variant="secondary">
                {genreItem.genre.name}
              </Badge>
            ))}
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-2">Description</h2>
            <p className="text-muted-foreground">
              {media.description || "No description available."}
            </p>
          </div>

          <div className="mt-8 flex gap-4">
            {isAuthenticated ? (
              <>
                <AddToListModal media={media} />
              </>
            ) : (
              <Button asChild>
                <a href="/login?redirect=/media/${media.id}">
                  Login to Add to List
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Rating and Reviews Section */}
      <div className="mt-12">
        <MediaRatingReviews mediaId={media.id} mediaTitle={media.title} />
      </div>

      {/* Similar Media Recommendations */}
      <SimilarRecommendations mediaId={media.id} />
    </div>
  );
}
