import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, Clock, ListIcon } from "lucide-react";
import type { MediaList } from "@/lib/features/lists/listsSlice";

interface ListCardProps {
  list: MediaList;
}

export function ListCard({ list }: ListCardProps) {
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Link href={`/lists/${list.id}`}>
      <Card className="h-full transition-all hover:shadow-md hover:-translate-y-1">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold truncate">{list.name}</h3>
            <Badge variant={list.isPublic ? "default" : "outline"}>
              {list.isPublic ? (
                <Eye className="h-3 w-3 mr-1" />
              ) : (
                <EyeOff className="h-3 w-3 mr-1" />
              )}
              {list.isPublic ? "Public" : "Private"}
            </Badge>
          </div>

          {list.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {list.description}
            </p>
          )}

          <div className="flex items-center text-sm text-muted-foreground">
            <ListIcon className="h-4 w-4 mr-1" />
            <span>
              {list.itemCount} {list.itemCount === 1 ? "item" : "items"}
            </span>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0 text-xs text-muted-foreground">
          <Clock className="h-3 w-3 mr-1" /> Updated{" "}
          {formatDate(list.updatedAt)}
        </CardFooter>
      </Card>
    </Link>
  );
}
