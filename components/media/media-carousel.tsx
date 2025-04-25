"use client";

import { useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { MediaCard } from "./media-card";
import { MediaCardSkeleton } from "./media-card-skeleton";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { MediaItem } from "@/lib/features/media/mediaSlice";

interface MediaCarouselProps {
  title: string;
  items: MediaItem[];
  isLoading: boolean;
  error?: string | null;
  emptyMessage?: string;
  viewAllHref?: string;
}

export function MediaCarousel({
  title,
  items,
  isLoading,
  error,
  emptyMessage,
  viewAllHref,
}: MediaCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    dragFree: true,
  });

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const onSelect = () => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  };

  useEffect(() => {
    if (!emblaApi) return;

    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);

    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  const scrollPrev = () => emblaApi && emblaApi.scrollPrev();
  const scrollNext = () => emblaApi && emblaApi.scrollNext();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{title}</h2>
        <div className="flex space-x-2">
          {viewAllHref && (
            <Button variant="link" asChild className="mr-2">
              <a href={viewAllHref}>View All</a>
            </Button>
          )}
          <Button
            variant="outline"
            size="icon"
            onClick={scrollPrev}
            disabled={isLoading || !canScrollPrev}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={scrollNext}
            disabled={isLoading || !canScrollNext}
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next</span>
          </Button>
        </div>
      </div>

      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-4">
          {isLoading ? (
            // Loading skeletons
            Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex-[0_0_280px] min-w-0">
                <MediaCardSkeleton />
              </div>
            ))
          ) : error ? (
            // Error state
            <div className="w-full py-8 text-center text-muted-foreground">
              {error}
            </div>
          ) : items.length === 0 ? (
            // Empty state
            <div className="w-full py-8 text-center text-muted-foreground">
              {emptyMessage || "No items found"}
            </div>
          ) : (
            // Items
            items.map((item) => (
              <div key={item.id} className="flex-[0_0_280px] min-w-0">
                <MediaCard media={item} />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
