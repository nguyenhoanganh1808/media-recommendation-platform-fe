"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  saveUserPreferences,
  selectUserPreferences,
  selectPreferencesStatus,
} from "@/lib/features/recommendations/recommendationsSlice";
import type { UserPreferences } from "@/lib/features/recommendations/recommendationsSlice";
import type { RootState, AppDispatch } from "@/lib/store";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  fetchAllGenres,
  selectAllGenres,
  selectGenresStatus,
} from "@/lib/features/genres/genresSlice";
import { Skeleton } from "@/components/ui/skeleton";

export default function PreferencesPage() {
  const { isAuthenticated, user } = useSelector(
    (state: RootState) => state.auth
  );
  const savedPreferences = useSelector(selectUserPreferences);
  const preferencesStatus = useSelector(selectPreferencesStatus);
  const genres = useSelector(selectAllGenres);
  const genresStatus = useSelector(selectGenresStatus);

  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [movieStrength, setMovieStrength] = useState(0.5);
  const [gameStrength, setGameStrength] = useState(0.5);
  const [mangaStrength, setMangaStrength] = useState(0.5);

  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  // Fetch genres when component mounts
  useEffect(() => {
    if (genresStatus === "idle") {
      dispatch(fetchAllGenres({ limit: 100 })); // Fetch all genres
    }
  }, [dispatch, genresStatus]);

  // Initialize form with saved preferences if available
  useEffect(() => {
    if (savedPreferences) {
      setSelectedGenres(savedPreferences.genreIds);

      savedPreferences.mediaTypePreferences.forEach((pref) => {
        if (pref.type === "MOVIE") setMovieStrength(pref.strength);
        if (pref.type === "GAME") setGameStrength(pref.strength);
        if (pref.type === "MANGA") setMangaStrength(pref.strength);
      });
    }
  }, [savedPreferences]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  const handleGenreToggle = (genreId: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genreId)
        ? prev.filter((id) => id !== genreId)
        : [...prev, genreId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const preferences: UserPreferences = {
      genreIds: selectedGenres,
      mediaTypePreferences: [
        { type: "MOVIE", strength: movieStrength },
        { type: "GAME", strength: gameStrength },
        { type: "MANGA", strength: mangaStrength },
      ],
    };

    try {
      await dispatch(
        saveUserPreferences({ userId: user!.id, preferences: preferences })
      ).unwrap();
      toast.success("Success", {
        description: "Your preferences have been updated",
      });
      router.push("/recommendations");
    } catch (error) {
      toast.error("Error", {
        description:
          error instanceof Error
            ? error.message
            : "Failed to update preferences",
      });
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="container py-8">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => router.push("/recommendations")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Recommendations
      </Button>

      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Recommendation Preferences</CardTitle>
          <CardDescription>
            Customize your preferences to get better recommendations. Select
            your favorite genres and adjust how much you want to see of each
            media type.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Favorite Genres</h3>
              <p className="text-sm text-muted-foreground">
                Select the genres you&apos;re interested in. You can select
                multiple genres.
              </p>
              {genresStatus === "loading" ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {Array.from({ length: 12 }).map((_, index) => (
                    <Skeleton key={index} className="h-8" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {genres.map((genre) => (
                    <div key={genre.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`genre-${genre.id}`}
                        checked={selectedGenres.includes(genre.id)}
                        onCheckedChange={() => handleGenreToggle(genre.id)}
                      />
                      <Label htmlFor={`genre-${genre.id}`}>{genre.name}</Label>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-6">
              <h3 className="text-lg font-medium">Media Type Preferences</h3>
              <p className="text-sm text-muted-foreground">
                Adjust how much of each media type you want to see in your
                recommendations.
              </p>

              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="movie-strength">Movies</Label>
                    <span className="text-sm text-muted-foreground">
                      {Math.round(movieStrength * 100)}%
                    </span>
                  </div>
                  <Slider
                    id="movie-strength"
                    min={0}
                    max={1}
                    step={0.1}
                    value={[movieStrength]}
                    onValueChange={(value) => setMovieStrength(value[0])}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="game-strength">Games</Label>
                    <span className="text-sm text-muted-foreground">
                      {Math.round(gameStrength * 100)}%
                    </span>
                  </div>
                  <Slider
                    id="game-strength"
                    min={0}
                    max={1}
                    step={0.1}
                    value={[gameStrength]}
                    onValueChange={(value) => setGameStrength(value[0])}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="manga-strength">Manga</Label>
                    <span className="text-sm text-muted-foreground">
                      {Math.round(mangaStrength * 100)}%
                    </span>
                  </div>
                  <Slider
                    id="manga-strength"
                    min={0}
                    max={1}
                    step={0.1}
                    value={[mangaStrength]}
                    onValueChange={(value) => setMangaStrength(value[0])}
                  />
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-between mt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/recommendations")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={preferencesStatus === "loading"}>
              {preferencesStatus === "loading" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Preferences"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
