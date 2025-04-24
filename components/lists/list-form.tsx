"use client";

import type React from "react";

import { useState } from "react";
import { useDispatch } from "react-redux";
import {
  createNewList,
  updateExistingList,
  type MediaList,
} from "@/lib/features/lists/listsSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import type { AppDispatch } from "@/lib/store";

interface ListFormProps {
  list?: MediaList;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ListForm({ list, onSuccess, onCancel }: ListFormProps) {
  const [name, setName] = useState(list?.name || "");
  const [description, setDescription] = useState(list?.description || "");
  const [isPublic, setIsPublic] = useState(list?.isPublic || false);
  const [isLoading, setIsLoading] = useState(false);

  const dispatch = useDispatch<AppDispatch>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Error", {
        description: "List name is required",
      });
      return;
    }

    setIsLoading(true);

    try {
      if (list) {
        // Update existing list
        await dispatch(
          updateExistingList({
            listId: list.id,
            name,
            description: description || undefined,
            isPublic,
          })
        ).unwrap();

        toast.success("Success", {
          description: "List updated successfully",
        });
      } else {
        // Create new list
        await dispatch(
          createNewList({
            name,
            description: description || undefined,
            isPublic,
          })
        ).unwrap();

        toast.success("Success", {
          description: "List created successfully",
        });
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast.error("Error", {
        description:
          error instanceof Error ? error.message : "Failed to save list",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">List Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter list name"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter list description"
          rows={3}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="isPublic"
          checked={isPublic}
          onCheckedChange={setIsPublic}
        />
        <Label htmlFor="isPublic">Make this list public</Label>
      </div>

      <div className="flex justify-end space-x-2 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {list ? "Updating..." : "Creating..."}
            </>
          ) : list ? (
            "Update List"
          ) : (
            "Create List"
          )}
        </Button>
      </div>
    </form>
  );
}
