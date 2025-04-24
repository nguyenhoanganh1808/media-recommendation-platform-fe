"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  fetchList,
  deleteExistingList,
  reorderListItems,
  selectCurrentList,
  selectListsStatus,
  selectListsError,
} from "@/lib/features/lists/listsSlice";
import type { RootState, AppDispatch } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { SortableListItem } from "@/components/lists/sortable-list-item";
import { ListForm } from "@/components/lists/list-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertCircle,
  ArrowLeft,
  Eye,
  EyeOff,
  MoreVertical,
  Edit,
  Trash2,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

export default function ListDetailPage() {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const listId = params.id as string;
  const list = useSelector(selectCurrentList);
  const status = useSelector(selectListsStatus);
  const error = useSelector(selectListsError);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  // Set up DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated && listId) {
      dispatch(fetchList(listId));
    }
  }, [dispatch, listId, isAuthenticated]);

  const handleDeleteList = async () => {
    setIsDeleting(true);
    try {
      await dispatch(deleteExistingList(listId)).unwrap();
      toast.success("Success", {
        description: "List deleted successfully",
      });
      router.push("/lists");
    } catch (error) {
      toast.error("Error", {
        description:
          error instanceof Error ? error.message : "Failed to delete list",
      });
      setDeleteDialogOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id || !list) {
      return;
    }

    // Find the indices of the items
    const oldIndex = list.items.findIndex((item) => item.id === active.id);
    const newIndex = list.items.findIndex((item) => item.id === over.id);

    if (oldIndex !== newIndex) {
      // Create a new array with the updated order
      const newItems = arrayMove(list.items, oldIndex, newIndex);

      // Dispatch the reorder action
      dispatch(reorderListItems({ listId, items: newItems }));

      toast.success("Success", {
        description: "List order updated",
      });
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  // Loading state
  if (status === "loading" && !list) {
    return (
      <div className="container py-8">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => router.push("/lists")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Lists
        </Button>

        <div className="space-y-4">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-4 w-1/4" />

          <div className="grid grid-cols-1 gap-4 mt-8">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-40" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (status === "failed") {
    return (
      <div className="container py-8">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => router.push("/lists")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Lists
        </Button>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error || "Failed to load list. Please try again later."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // No list found
  if (!list) {
    return (
      <div className="container py-8">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => router.push("/lists")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Lists
        </Button>

        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">List Not Found</h2>
          <p className="text-muted-foreground">
            The requested list could not be found.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => router.push("/lists")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Lists
      </Button>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">{list.name}</h1>
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
            <p className="text-muted-foreground mt-1">{list.description}</p>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <MoreVertical className="h-4 w-4 mr-2" />
              Actions
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit List
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setDeleteDialogOpen(true)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete List
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {list.items.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <h2 className="text-xl font-semibold mb-2">This list is empty</h2>
          <p className="text-muted-foreground mb-6">
            Browse media and add items to this list
          </p>
          <Button asChild>
            <a href="/browse">Browse Media</a>
          </Button>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={list.items.map((item) => item.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4">
              {list.items.map((item) => (
                <SortableListItem key={item.id} item={item} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Edit List Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit List</DialogTitle>
            <DialogDescription>Update your list details</DialogDescription>
          </DialogHeader>
          <ListForm
            list={list}
            onSuccess={() => setEditDialogOpen(false)}
            onCancel={() => setEditDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete List Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete List</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this list? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteList}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete List
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
