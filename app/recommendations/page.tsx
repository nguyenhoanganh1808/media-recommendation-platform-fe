"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchPersonalized,
  fetchTrending,
  selectPersonalizedRecommendations,
  selectTrendingMedia,
  selectPersonalizedStatus,
  selectTrendingStatus,
  selectRecommendationsError,
  selectRecommendationsPagination,
  type RecommendationsParams,
} from "@/lib/features/recommendations/recommendationsSlice";
import type { MediaType } from "@/lib/features/media/mediaSlice";
import type { RootState, AppDispatch } from "@/lib/store";
import { MediaCarousel } from "@/components/media/media-carousel";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pagination } from "@/components/lists/pagination";
import { Settings } from "lucide-react";
import Link from "next/link";

export default function RecommendationsPage() {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const personalizedRecommendations = useSelector(
    selectPersonalizedRecommendations
  );
  const trendingMedia = useSelector(selectTrendingMedia);
  const personalizedStatus = useSelector(selectPersonalizedStatus);
  const trendingStatus = useSelector(selectTrendingStatus);
  const error = useSelector(selectRecommendationsError);
  const pagination = useSelector(selectRecommendationsPagination);

  const [activeTab, setActiveTab] = useState<string>("all");
  const [params, setParams] = useState<RecommendationsParams>({
    limit: 10,
    page: 1,
    includeRated: false,
  });

  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      // Set mediaType based on active tab
      const mediaType =
        activeTab !== "all"
          ? (activeTab.toUpperCase() as MediaType)
          : undefined;

      const currentParams = {
        ...params,
        mediaType,
      };

      dispatch(fetchPersonalized(currentParams));
      dispatch(fetchTrending(currentParams));
    }
  }, [dispatch, isAuthenticated, activeTab, params]);

  const handlePageChange = (page: number) => {
    setParams((prev) => ({ ...prev, page }));
  };

  const handleLimitChange = (limit: number) => {
    setParams((prev) => ({ ...prev, limit, page: 1 }));
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setParams((prev) => ({ ...prev, page: 1 }));
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Recommendations</h1>
        <Button asChild variant="outline">
          <Link href="/recommendations/preferences">
            <Settings className="mr-2 h-4 w-4" />
            Customize Preferences
          </Link>
        </Button>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="space-y-8"
      >
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="movie">Movies</TabsTrigger>
          <TabsTrigger value="game">Games</TabsTrigger>
          <TabsTrigger value="manga">Manga</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-12">
          <MediaCarousel
            title="Personalized For You"
            items={personalizedRecommendations}
            isLoading={personalizedStatus === "loading"}
            error={personalizedStatus === "failed" ? error : null}
            emptyMessage="We're still learning your preferences. Add more items to your lists or update your preferences."
          />

          <MediaCarousel
            title="Trending Now"
            items={trendingMedia}
            isLoading={trendingStatus === "loading"}
            error={trendingStatus === "failed" ? error : null}
            emptyMessage="No trending items available at the moment."
          />

          {/* {pagination.totalPages > 1 && (
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
              itemsPerPage={pagination.itemsPerPage}
              onItemsPerPageChange={handleLimitChange}
              totalItems={pagination.totalItems}
            />
          )} */}
        </TabsContent>
      </Tabs>
    </div>
  );
}
