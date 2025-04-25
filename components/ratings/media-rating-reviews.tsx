"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { StarRating } from "./star-rating";
// import { ReviewForm } from "./review-form"
// import { ReviewList } from "./review-list"
import { AlertCircle } from "lucide-react";
import type { RootState } from "@/lib/store";
import { ReviewForm } from "./review-form";
import { ReviewList } from "./review-list";

interface MediaRatingReviewsProps {
  mediaId: string;
  mediaTitle: string;
  className?: string;
}

export function MediaRatingReviews({
  mediaId,
  mediaTitle,
  className,
}: MediaRatingReviewsProps) {
  const [activeTab, setActiveTab] = useState("rate");
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const error = useSelector((state: RootState) => state.ratings.error);

  if (!isAuthenticated) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Ratings & Reviews</CardTitle>
          <CardDescription>
            Sign in to rate and review {mediaTitle}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-muted-foreground">
              You need to be logged in to rate or review this media.
            </p>
            <a
              href={`/login?redirect=/media/${mediaId}`}
              className="text-primary hover:underline mt-2 inline-block"
            >
              Login to continue
            </a>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Ratings & Reviews</CardTitle>
        <CardDescription>
          Share your thoughts about {mediaTitle}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="rate">Rate</TabsTrigger>
            <TabsTrigger value="review">Review</TabsTrigger>
          </TabsList>

          <TabsContent value="rate" className="space-y-4">
            <div className="flex flex-col items-center py-4">
              <h3 className="text-lg font-medium mb-4">Rate this media</h3>
              <StarRating
                mediaId={mediaId}
                size="lg"
                onRatingChange={() => {
                  // if (rating && !activeTab.includes("review")) {
                  //   setActiveTab("review");
                  // }
                }}
              />
            </div>
          </TabsContent>

          <TabsContent value="review" className="space-y-4">
            <ReviewForm mediaId={mediaId} />
          </TabsContent>
        </Tabs>

        <div className="mt-8 pt-4 border-t">
          <ReviewList mediaId={mediaId} />
        </div>
      </CardContent>
    </Card>
  );
}
