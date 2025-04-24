"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchSimilar,
  selectSimilarMedia,
  selectSimilarStatus,
} from "@/lib/features/recommendations/recommendationsSlice";
import { MediaCarousel } from "@/components/media/media-carousel";
import type { AppDispatch } from "@/lib/store";

interface SimilarRecommendationsProps {
  mediaId: string;
  className?: string;
}

export function SimilarRecommendations({
  mediaId,
  className,
}: SimilarRecommendationsProps) {
  const dispatch = useDispatch<AppDispatch>();
  const similarMedia = useSelector(selectSimilarMedia(mediaId));
  const status = useSelector(selectSimilarStatus(mediaId));

  useEffect(() => {
    dispatch(fetchSimilar(mediaId));
  }, [dispatch, mediaId]);

  return (
    <div className={className}>
      <MediaCarousel
        title="Users Who Rated This Also Enjoyed"
        items={similarMedia}
        isLoading={status === "loading"}
        emptyMessage="No similar recommendations found."
        viewAllHref="/recommendations"
      />
    </div>
  );
}
