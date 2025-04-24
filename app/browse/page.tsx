"use client";

import type { AppDispatch } from "@/lib/store";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchMediaItems } from "@/lib/features/media/mediaSlice";
import { FilterBar } from "@/components/media/filter-bar";
import { MediaGrid } from "@/components/media/media-grid";
import { Pagination } from "@/components/media/pagination";

export default function BrowsePage() {
  const dispatch = useDispatch<AppDispatch>();

  // Initial data fetch
  useEffect(() => {
    dispatch(fetchMediaItems());
  }, [dispatch]);

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Browse Media</h1>

      <FilterBar />

      <div className="mt-6">
        <MediaGrid />
      </div>

      <div className="mt-6">
        <Pagination />
      </div>
    </div>
  );
}
