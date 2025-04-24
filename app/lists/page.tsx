"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import {
  fetchLists,
  selectAllLists,
  selectListsStatus,
  selectListsPagination,
} from "@/lib/features/lists/listsSlice";
import type { RootState, AppDispatch } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { ListCard } from "@/components/lists/list-card";
import { ListForm } from "@/components/lists/list-form";
import { Pagination } from "@/components/lists/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertCircle, Plus } from "lucide-react";

export default function ListsPage() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const lists = useSelector(selectAllLists);
  const status = useSelector(selectListsStatus);
  const pagination = useSelector(selectListsPagination);
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchLists({}));
    }
  }, [dispatch, isAuthenticated]);

  const handlePageChange = (page: number) => {
    dispatch(fetchLists({ page }));
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">My Lists</h1>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create List
        </Button>
      </div>

      {status === "loading" && lists.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-40" />
          ))}
        </div>
      ) : status === "failed" ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load lists. Please try again later.
          </AlertDescription>
        </Alert>
      ) : lists.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">
            You don&apos;t have any lists yet
          </h2>
          <p className="text-muted-foreground mb-6">
            Create your first list to start organizing your media
          </p>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Your First List
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {lists.map((list) => (
              <ListCard key={list.id} list={list} />
            ))}
          </div>

          {pagination.totalPages > 1 && (
            <div className="mt-6">
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      )}

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New List</DialogTitle>
            <DialogDescription>
              Create a new list to organize your favorite media
            </DialogDescription>
          </DialogHeader>
          <ListForm
            onSuccess={() => setCreateDialogOpen(false)}
            onCancel={() => setCreateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
