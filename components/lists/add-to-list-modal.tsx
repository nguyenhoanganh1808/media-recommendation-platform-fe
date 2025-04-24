"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchLists,
  createNewList,
  addToList,
  selectAllLists,
  selectListsStatus,
} from "@/lib/features/lists/listsSlice";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ListPlus, Plus, Loader2 } from "lucide-react";
import type { AppDispatch } from "@/lib/store";
import type { MediaItem } from "@/lib/features/media/mediaSlice";
import { toast } from "sonner";

interface AddToListModalProps {
  media: MediaItem;
  trigger?: React.ReactNode;
}

export function AddToListModal({ media, trigger }: AddToListModalProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("existing");
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New list form state
  const [newListName, setNewListName] = useState("");
  const [newListDescription, setNewListDescription] = useState("");
  const [newListIsPublic, setNewListIsPublic] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const lists = useSelector(selectAllLists);
  const listsStatus = useSelector(selectListsStatus);

  // Fetch lists when modal opens
  useEffect(() => {
    if (open && listsStatus === "idle") {
      dispatch(fetchLists({}));
    }
  }, [open, listsStatus, dispatch]);

  const handleSubmit = async () => {
    if (activeTab === "existing" && !selectedListId) {
      toast.error("Error", {
        description: "Please select a list",
      });
      return;
    }

    if (activeTab === "new" && !newListName.trim()) {
      toast.error("Error", {
        description: "Please enter a list name",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let listId = selectedListId;

      // If creating a new list, create it first
      if (activeTab === "new") {
        const newList = await dispatch(
          createNewList({
            name: newListName,
            description: newListDescription || undefined,
            isPublic: newListIsPublic,
          })
        ).unwrap();

        listId = newList.id;
      }

      // Add media to the list
      if (listId) {
        await dispatch(
          addToList({
            listId,
            mediaId: media.id,
            notes: notes || undefined,
          })
        ).unwrap();

        toast.success("Success", {
          description: `${media.title} added to list`,
        });

        // Reset form and close modal
        resetForm();
        setOpen(false);
      }
    } catch (error) {
      toast.error("Error", {
        description:
          error instanceof Error ? error.message : "Failed to add to list",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedListId(null);
    setNotes("");
    setNewListName("");
    setNewListDescription("");
    setNewListIsPublic(false);
    setActiveTab("existing");
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        setOpen(newOpen);
        if (!newOpen) resetForm();
      }}
    >
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <ListPlus className="mr-2 h-4 w-4" />
            Add to List
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add to List</DialogTitle>
          <DialogDescription>
            Add "{media.title}" to one of your lists or create a new list.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="existing">Existing List</TabsTrigger>
            <TabsTrigger value="new">New List</TabsTrigger>
          </TabsList>

          <TabsContent value="existing" className="mt-4">
            {listsStatus === "loading" ? (
              <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : lists.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-muted-foreground">
                  You don't have any lists yet.
                </p>
                <Button
                  variant="link"
                  onClick={() => setActiveTab("new")}
                  className="mt-2"
                >
                  Create your first list
                </Button>
              </div>
            ) : (
              <ScrollArea className="h-[200px] pr-4">
                <RadioGroup
                  value={selectedListId || ""}
                  onValueChange={setSelectedListId}
                >
                  {lists.map((list) => (
                    <div
                      key={list.id}
                      className="flex items-center space-x-2 py-2"
                    >
                      <RadioGroupItem value={list.id} id={list.id} />
                      <Label
                        htmlFor={list.id}
                        className="flex-1 cursor-pointer"
                      >
                        <div className="font-medium">{list.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {list.itemCount}{" "}
                          {list.itemCount === 1 ? "item" : "items"} •
                          {list.isPublic ? " Public" : " Private"}
                        </div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </ScrollArea>
            )}

            <div className="mt-4">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about this media..."
                rows={3}
              />
            </div>
          </TabsContent>

          <TabsContent value="new" className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newListName">List Name</Label>
              <Input
                id="newListName"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                placeholder="Enter list name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newListDescription">Description (Optional)</Label>
              <Textarea
                id="newListDescription"
                value={newListDescription}
                onChange={(e) => setNewListDescription(e.target.value)}
                placeholder="Enter list description"
                rows={2}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="newListIsPublic"
                checked={newListIsPublic}
                onCheckedChange={setNewListIsPublic}
              />
              <Label htmlFor="newListIsPublic">Make this list public</Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newItemNotes">
                Notes for this item (Optional)
              </Label>
              <Textarea
                id="newItemNotes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about this media..."
                rows={2}
              />
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Add to List
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
