import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import type { MediaItem } from "@/lib/features/media/mediaSlice";
import Link from "next/link";
import { QuickRating } from "../ratings/quick-rating";

interface MediaCardProps {
  media: MediaItem;
}

export function MediaCard({ media }: MediaCardProps) {
  // Extract year from release date
  const releaseYear = new Date(media.releaseDate).getFullYear();

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

  return (
    <Link href={`/media/${media.id}`}>
      <Card className="overflow-hidden h-full transition-all hover:shadow-lg hover:-translate-y-1">
        <div className="relative aspect-[2/3] overflow-hidden">
          <img
            src={media.coverImage || "/placeholder.svg"}
            alt={media.title}
            className="object-cover w-full h-full"
          />
          <Badge
            className={`absolute top-2 right-2 ${getTypeColor(media.mediaType || "ALL")}`}
          >
            {media.mediaType}
          </Badge>
          <div className="absolute top-2 left-2">
            <QuickRating mediaId={media.id} />
          </div>
        </div>
        <CardContent className="p-4">
          <h3 className="font-bold line-clamp-2">{media.title}</h3>
          {media.originalTitle && (
            <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
              {media.originalTitle}
            </p>
          )}
          <div className="flex items-center mt-2 text-sm">
            <span className="mr-2">{releaseYear}</span>
            <div className="flex items-center text-yellow-500">
              <Star className="h-4 w-4 fill-current" />
              <span className="ml-1">{media.averageRating.toFixed(1)}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex flex-wrap gap-1">
          {media.genres.slice(0, 2).map((genreItem) => (
            <Badge
              key={genreItem.genreId}
              variant="outline"
              className="text-xs"
            >
              {genreItem.genre.name}
            </Badge>
          ))}
        </CardFooter>
      </Card>
    </Link>
  );
}
