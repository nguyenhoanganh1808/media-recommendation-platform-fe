"use client";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { removeFromList } from "@/lib/features/lists/listsSlice";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
  Star,
  MoreVertical,
  Trash2,
  Edit,
  X,
  Check,
  GripVertical,
} from "lucide-react";
import Link from "next/link";
import type { ListItem } from "@/lib/features/lists/listsSlice";
import type { AppDispatch } from "@/lib/store";

interface ListItemCardProps {
  item: ListItem;
  isDragging?: boolean;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
}

export function ListItemCard({
  item,
  isDragging,
  dragHandleProps,
}: ListItemCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [notes, setNotes] = useState(item.notes || "");
  // const [isDeleting, setIsDeleting] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
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
  const releaseYear = new Date(item.media.releaseDate).getFullYear();

  const handleDelete = async () => {
    // setIsDeleting(true);
    try {
      await dispatch(
        removeFromList({ listId: item.listId, itemId: item.id })
      ).unwrap();
      toast.success("Success", {
        description: "Item removed from list",
      });
    } catch (error) {
      toast.error("Error", {
        description:
          error instanceof Error ? error.message : "Failed to remove item",
      });
    } finally {
      // setIsDeleting(false);
    }
  };

  const handleSaveNotes = async () => {
    // In a real app, you would dispatch an action to update the notes
    // For this demo, we'll just toggle the editing state
    setIsEditing(false);
    toast.success("Success", {
      description: "Notes updated",
    });
  };

  return (
    <Card className={`overflow-hidden ${isDragging ? "opacity-50" : ""}`}>
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          <div className="relative sm:w-1/4 md:w-1/5">
            <Link href={`/media/${item.media.id}`}>
              <div className="aspect-[2/3] overflow-hidden">
                <img
                  src={item.media.coverImage || "/placeholder.svg"}
                  alt={item.media.title}
                  className="object-cover w-full h-full"
                />
              </div>
            </Link>
            <Badge
              className={`absolute top-2 right-2 ${getTypeColor(
                item.media.mediaType || ""
              )}`}
            >
              {item.media.mediaType}
            </Badge>
          </div>

          <div className="p-4 flex-1 flex flex-col">
            <div className="flex items-start justify-between">
              <div>
                <Link
                  href={`/media/${item.media.id}`}
                  className="hover:underline"
                >
                  <h3 className="font-bold">{item.media.title}</h3>
                </Link>
                {item.media.originalTitle && (
                  <p className="text-sm text-muted-foreground">
                    {item.media.originalTitle}
                  </p>
                )}
                <div className="flex items-center mt-1 text-sm">
                  <span className="mr-2">{releaseYear}</span>
                  <div className="flex items-center text-yellow-500">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="ml-1">
                      {item.media.averageRating.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center">
                <div {...(dragHandleProps || {})} className="cursor-grab mr-2">
                  <GripVertical className="h-5 w-5 text-muted-foreground" />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                      <span className="sr-only">Actions</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setIsEditing(true)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Notes
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleDelete}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove from List
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {isEditing ? (
              <div className="mt-3">
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes about this item..."
                  rows={3}
                  className="resize-none"
                />
                <div className="flex justify-end mt-2 space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setNotes(item.notes || "");
                      setIsEditing(false);
                    }}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSaveNotes}>
                    <Check className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                </div>
              </div>
            ) : (
              item.notes && (
                <div className="mt-3 text-sm">
                  <p className="text-muted-foreground font-medium mb-1">
                    Notes:
                  </p>
                  <p>{item.notes}</p>
                </div>
              )
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
