"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useDebounce } from "@/hooks/use-debounce";
import {
  setFilter,
  type MediaType,
  type SortOption,
  type SortOrder,
} from "@/lib/features/media/mediaSlice";
import { AppDispatch, type RootState } from "@/lib/store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, SlidersHorizontal, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  fetchAllGenres,
  selectAllGenres,
  selectGenresStatus,
} from "@/lib/features/genres/genresSlice";
import { Skeleton } from "../ui/skeleton";

export function FilterBar() {
  const dispatch = useDispatch<AppDispatch>();
  const { filters } = useSelector((state: RootState) => state.media);
  const genres = useSelector(selectAllGenres);
  const genresStatus = useSelector(selectGenresStatus);

  // Local state for search input
  const [searchInput, setSearchInput] = useState(filters.search);
  const debouncedSearch = useDebounce(searchInput, 300);

  // Local state for mobile filters
  const [mobileType, setMobileType] = useState<MediaType>(filters.type);
  const [mobileGenre, setMobileGenre] = useState<string | null>(filters.genre);
  const [mobileSortBy, setMobileSortBy] = useState<SortOption>(filters.sortBy);
  const [mobileSortOrder, setMobileSortOrder] = useState<SortOrder>(
    filters.sortOrder
  );

  // Fetch genres when component mounts
  useEffect(() => {
    if (genresStatus === "idle") {
      dispatch(
        fetchAllGenres({
          page: filters.page,
          limit: 100,
        })
      );
    }
  }, [dispatch, genresStatus]);

  // Apply debounced search
  useEffect(() => {
    dispatch(setFilter({ search: debouncedSearch }));
  }, [debouncedSearch, dispatch]);

  // Handle filter changes
  const handleTypeChange = (value: string) => {
    const mediaType = value === "ALL" ? null : (value as MediaType);
    dispatch(setFilter({ type: mediaType, genre: null })); // Reset genre when type changes
  };

  const handleGenreChange = (value: string) => {
    dispatch(setFilter({ genre: value === "ALL" ? null : value }));
  };

  const handleSortChange = (value: string) => {
    const [sortBy, sortOrder] = value.split("-") as [SortOption, SortOrder];
    dispatch(setFilter({ sortBy, sortOrder }));
  };

  // Apply mobile filters
  const applyMobileFilters = () => {
    dispatch(
      setFilter({
        type: mobileType,
        genre: mobileGenre,
        sortBy: mobileSortBy,
        sortOrder: mobileSortOrder,
      })
    );
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchInput("");
    dispatch(
      setFilter({
        type: null,
        genre: null,
        search: "",
        sortBy: "popularity",
        sortOrder: "desc",
      })
    );

    // Reset mobile filters too
    setMobileType(null);
    setMobileGenre(null);
    setMobileSortBy("popularity");
    setMobileSortOrder("desc");
  };

  // Current sort value
  const currentSortValue = `${filters.sortBy}-${filters.sortOrder}`;

  return (
    <div className="w-full space-y-4">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search titles..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="pl-10 pr-10"
        />
        {searchInput && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-full"
            onClick={() => setSearchInput("")}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Clear search</span>
          </Button>
        )}
      </div>

      {/* Desktop filters */}
      <div className="hidden md:flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Label htmlFor="type-filter" className="whitespace-nowrap">
            Media Type:
          </Label>
          <Select
            value={filters.type || "ALL"}
            onValueChange={handleTypeChange}
          >
            <SelectTrigger id="type-filter" className="w-[140px]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Types</SelectItem>
              <SelectItem value="MOVIE">Movies</SelectItem>
              <SelectItem value="GAME">Games</SelectItem>
              <SelectItem value="MANGA">Manga</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Label htmlFor="genre-filter" className="whitespace-nowrap">
            Genre:
          </Label>
          <Select
            value={filters.genre || "ALL"}
            onValueChange={handleGenreChange}
          >
            <SelectTrigger id="genre-filter" className="w-[160px]">
              <SelectValue placeholder="All Genres" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Genres</SelectItem>
              {genresStatus === "loading" ? (
                <div className="p-2">
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ) : (
                genres.map((genre) => (
                  <SelectItem key={genre.id} value={genre.name}>
                    {genre.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Label htmlFor="sort-filter" className="whitespace-nowrap">
            Sort By:
          </Label>
          <Select value={currentSortValue} onValueChange={handleSortChange}>
            <SelectTrigger id="sort-filter" className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popularity-desc">Most Popular</SelectItem>
              <SelectItem value="popularity-asc">Least Popular</SelectItem>
              <SelectItem value="releaseDate-desc">Newest First</SelectItem>
              <SelectItem value="releaseDate-asc">Oldest First</SelectItem>
              <SelectItem value="averageRating-desc">Highest Rated</SelectItem>
              <SelectItem value="averageRating-asc">Lowest Rated</SelectItem>
              <SelectItem value="title-asc">Title (A-Z)</SelectItem>
              <SelectItem value="title-desc">Title (Z-A)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={resetFilters}
          className="ml-auto"
        >
          Reset Filters
        </Button>
      </div>

      {/* Mobile filters */}
      <div className="flex md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="w-full">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Filters & Sort
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh]">
            <SheetHeader>
              <SheetTitle>Filters & Sort</SheetTitle>
              <SheetDescription>
                Adjust filters to find the media you're looking for
              </SheetDescription>
            </SheetHeader>
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mobile-type">Media Type</Label>
                <Select
                  value={mobileType || "ALL"}
                  onValueChange={(value) =>
                    setMobileType(value === "ALL" ? null : (value as MediaType))
                  }
                >
                  <SelectTrigger id="mobile-type">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Types</SelectItem>
                    <SelectItem value="MOVIE">Movies</SelectItem>
                    <SelectItem value="GAME">Games</SelectItem>
                    <SelectItem value="MANGA">Manga</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mobile-genre">Genre</Label>
                <Select
                  value={mobileGenre || "ALL"}
                  onValueChange={(value) => {
                    setMobileType(
                      value === "ALL" ? null : (value as MediaType)
                    );
                    setMobileGenre(null); // Reset genre when type changes
                  }}
                >
                  <SelectTrigger id="mobile-genre">
                    <SelectValue placeholder="All Genres" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Genres</SelectItem>
                    {genresStatus === "loading" ? (
                      <div className="p-2">
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-full" />
                      </div>
                    ) : (
                      genres.map((genre) => (
                        <SelectItem key={genre.id} value={genre.name}>
                          {genre.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="mobile-sort">Sort By</Label>
                <Select
                  value={mobileSortBy}
                  onValueChange={(value) =>
                    setMobileSortBy(value as SortOption)
                  }
                >
                  <SelectTrigger id="mobile-sort">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popularity">Popularity</SelectItem>
                    <SelectItem value="releaseDate">Release Date</SelectItem>
                    <SelectItem value="averageRating">Rating</SelectItem>
                    <SelectItem value="title">Title</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mobile-order">Order</Label>
                <Select
                  value={mobileSortOrder}
                  onValueChange={(value) =>
                    setMobileSortOrder(value as SortOrder)
                  }
                >
                  <SelectTrigger id="mobile-order">
                    <SelectValue placeholder="Order" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">Descending</SelectItem>
                    <SelectItem value="asc">Ascending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <SheetFooter className="flex-row justify-between sm:justify-between">
              <SheetClose asChild>
                <Button
                  variant="outline"
                  onClick={() => {
                    setMobileType(filters.type);
                    setMobileGenre(filters.genre);
                    setMobileSortBy(filters.sortBy);
                    setMobileSortOrder(filters.sortOrder);
                  }}
                >
                  Cancel
                </Button>
              </SheetClose>
              <SheetClose asChild>
                <Button onClick={applyMobileFilters}>Apply Filters</Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
