import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchUserLists,
  fetchListDetails,
  createList,
  updateList,
  deleteList,
  addItemToList,
  removeItemFromList,
  reorderList,
  updateItemInList,
} from "@/lib/services/lists";
import type { RootState } from "@/lib/store";
import type { MediaItem } from "../media/mediaSlice";

export interface ListItem {
  id: string;
  mediaId: string;
  listId: string;
  notes: string | null;
  order: number;
  createdAt: string;
  updatedAt: string;
  media: MediaItem;
}

export interface MediaList {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  isPublic: boolean;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface MediaListDetails extends MediaList {
  items: ListItem[];
}

interface ListsState {
  lists: MediaList[];
  currentList: MediaListDetails | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

const initialState: ListsState = {
  lists: [],
  currentList: null,
  status: "idle",
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  },
};

// Async thunks
export const fetchLists = createAsyncThunk(
  "lists/fetchLists",
  async (
    { page = 1, limit = 10 }: { page?: number; limit?: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetchUserLists(page, limit);
      return response;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to fetch lists"
      );
    }
  }
);

export const fetchList = createAsyncThunk(
  "lists/fetchList",
  async (listId: string, { rejectWithValue }) => {
    try {
      const response = await fetchListDetails(listId);
      return response;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to fetch list details"
      );
    }
  }
);

export const createNewList = createAsyncThunk(
  "lists/createList",
  async (
    {
      name,
      description,
      isPublic,
    }: { name: string; description?: string; isPublic: boolean },
    { rejectWithValue }
  ) => {
    try {
      const response = await createList({ name, description, isPublic });
      return response;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to create list"
      );
    }
  }
);

export const updateExistingList = createAsyncThunk(
  "lists/updateList",
  async (
    {
      listId,
      name,
      description,
      isPublic,
    }: {
      listId: string;
      name: string;
      description?: string;
      isPublic: boolean;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await updateList(listId, {
        name,
        description,
        isPublic,
      });
      return response;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to update list"
      );
    }
  }
);

export const deleteExistingList = createAsyncThunk(
  "lists/deleteList",
  async (listId: string, { rejectWithValue }) => {
    try {
      await deleteList(listId);
      return listId;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to delete list"
      );
    }
  }
);

export const addToList = createAsyncThunk(
  "lists/addToList",
  async (
    {
      listId,
      mediaId,
      notes,
    }: { listId: string; mediaId: string; notes?: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await addItemToList(listId, mediaId, notes);
      return response;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to add item to list"
      );
    }
  }
);

export const updateListItemNotes = createAsyncThunk(
  "lists/updateListItemNotes",
  async (
    { itemId, notes }: { itemId: string; notes: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await updateItemInList(itemId, notes);
      console.log("updateListItemNotes response: ", response);
      return response;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : "Failed to update item notes in list"
      );
    }
  }
);

export const removeFromList = createAsyncThunk(
  "lists/removeFromList",
  async (
    { listId, itemId }: { listId: string; itemId: string },
    { rejectWithValue }
  ) => {
    try {
      await removeItemFromList(itemId);
      return { listId, itemId };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : "Failed to remove item from list"
      );
    }
  }
);

export const reorderListItems = createAsyncThunk(
  "lists/reorderItems",
  async (
    {
      listId,
      items,
    }: { listId: string; items: { id: string; order: number }[] },
    { rejectWithValue }
  ) => {
    try {
      await reorderList(listId, items);
      return { listId, items };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to reorder list"
      );
    }
  }
);

const listsSlice = createSlice({
  name: "lists",
  initialState,
  reducers: {
    clearCurrentList: (state) => {
      state.currentList = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch lists
      .addCase(fetchLists.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchLists.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.lists = action.payload.data;
        state.pagination = action.payload.meta.pagination;
        state.error = null;
      })
      .addCase(fetchLists.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Fetch list details
      .addCase(fetchList.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchList.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.currentList = action.payload;
        state.error = null;
      })
      .addCase(fetchList.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Create list
      .addCase(createNewList.pending, (state) => {
        state.status = "loading";
      })
      .addCase(createNewList.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.lists.push(action.payload);
        state.error = null;
      })
      .addCase(createNewList.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Update list
      .addCase(updateExistingList.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateExistingList.fulfilled, (state, action) => {
        state.status = "succeeded";
        const index = state.lists.findIndex(
          (list) => list.id === action.payload.id
        );
        if (index !== -1) {
          state.lists[index] = action.payload;
        }
        if (state.currentList && state.currentList.id === action.payload.id) {
          state.currentList = {
            ...action.payload,
            items: state.currentList.items,
          };
        }
        state.error = null;
      })
      .addCase(updateExistingList.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Delete list
      .addCase(deleteExistingList.pending, (state) => {
        state.status = "loading";
      })
      .addCase(deleteExistingList.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.lists = state.lists.filter((list) => list.id !== action.payload);
        if (state.currentList && state.currentList.id === action.payload) {
          state.currentList = null;
        }
        state.error = null;
      })
      .addCase(deleteExistingList.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Add item to list
      .addCase(addToList.pending, (state) => {
        state.status = "loading";
      })
      .addCase(addToList.fulfilled, (state, action) => {
        state.status = "succeeded";
        if (
          state.currentList &&
          state.currentList.id === action.payload.listId
        ) {
          state.currentList.items.push(action.payload);
          state.currentList.itemCount += 1;
        }
        // Update the item count in the lists array
        const listIndex = state.lists.findIndex(
          (list) => list.id === action.payload.listId
        );
        if (listIndex !== -1) {
          state.lists[listIndex].itemCount += 1;
        }
        state.error = null;
      })
      .addCase(addToList.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Update item in list
      .addCase(updateListItemNotes.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateListItemNotes.fulfilled, (state, action) => {
        state.status = "succeeded";
        console.log("action.payload: ", action.payload);
        if (
          state.currentList &&
          state.currentList.id === action.payload.listId
        ) {
          const itemIndex = state.currentList.items.findIndex(
            (item) => item.id === action.payload.id
          );
          if (itemIndex !== -1) {
            state.currentList.items[itemIndex].notes = action.payload.notes;
          }
        }

        state.error = null;
      })
      .addCase(updateListItemNotes.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Remove item from list
      .addCase(removeFromList.pending, (state) => {
        state.status = "loading";
      })
      .addCase(removeFromList.fulfilled, (state, action) => {
        state.status = "succeeded";
        if (
          state.currentList &&
          state.currentList.id === action.payload.listId
        ) {
          state.currentList.items = state.currentList.items.filter(
            (item) => item.id !== action.payload.itemId
          );
          state.currentList.itemCount -= 1;
        }
        // Update the item count in the lists array
        const listIndex = state.lists.findIndex(
          (list) => list.id === action.payload.listId
        );
        if (listIndex !== -1) {
          state.lists[listIndex].itemCount -= 1;
        }
        state.error = null;
      })
      .addCase(removeFromList.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Reorder list items
      .addCase(reorderListItems.pending, (state) => {
        state.status = "loading";
      })
      .addCase(reorderListItems.fulfilled, (state, action) => {
        state.status = "succeeded";
        if (
          state.currentList &&
          state.currentList.id === action.payload.listId
        ) {
          // Reorder items based on the new order of IDs
          const itemMap = new Map(
            state.currentList.items.map((item) => [item.id, item])
          );
          state.currentList.items = action.payload.items
            .map((it, index) => {
              const item = itemMap.get(it.id);
              if (item) {
                return { ...item, order: index };
              }
              return null;
            })
            .filter((item): item is ListItem => item !== null);
        }
        state.error = null;
      })
      .addCase(reorderListItems.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export const { clearCurrentList } = listsSlice.actions;

// Selectors
export const selectAllLists = (state: RootState) => state.lists.lists;
export const selectCurrentList = (state: RootState) => state.lists.currentList;
export const selectListsStatus = (state: RootState) => state.lists.status;
export const selectListsError = (state: RootState) => state.lists.error;
export const selectListsPagination = (state: RootState) =>
  state.lists.pagination;

export default listsSlice.reducer;
