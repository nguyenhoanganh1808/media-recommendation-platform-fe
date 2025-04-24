import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchUserProfile,
  fetchUserFollowers,
  fetchUserFollowing,
  followUser as followUserApi,
  unfollowUser as unfollowUserApi,
} from "@/lib/services/users";
import type { RootState } from "@/lib/store";

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  bio: string;
  avatar: string;
  createdAt: string;
  isFollowing: boolean;
  stats: {
    followersCount: number;
    followingCount: number;
    listsCount: number;
    ratingsCount: number;
  };
}

export interface UserItem {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  avatar: string;
  bio: string;
  isFollowing: boolean;
}

interface UserState {
  profile: UserProfile | null;
  followers: UserItem[];
  following: UserItem[];
  profileStatus: "idle" | "loading" | "succeeded" | "failed";
  followersStatus: "idle" | "loading" | "succeeded" | "failed";
  followingStatus: "idle" | "loading" | "succeeded" | "failed";
  followStatus: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: UserState = {
  profile: null,
  followers: [],
  following: [],
  profileStatus: "idle",
  followersStatus: "idle",
  followingStatus: "idle",
  followStatus: "idle",
  error: null,
};

// Async thunks
export const fetchProfile = createAsyncThunk(
  "users/fetchProfile",
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await fetchUserProfile(userId);
      return response;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to fetch user profile"
      );
    }
  }
);

export const fetchFollowers = createAsyncThunk(
  "users/fetchFollowers",
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await fetchUserFollowers(userId);
      return response;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to fetch followers"
      );
    }
  }
);

export const fetchFollowing = createAsyncThunk(
  "users/fetchFollowing",
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await fetchUserFollowing(userId);
      return response;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to fetch following"
      );
    }
  }
);

export const followUser = createAsyncThunk(
  "users/followUser",
  async (userId: string, { rejectWithValue, getState }) => {
    try {
      await followUserApi(userId);
      return userId;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to follow user"
      );
    }
  }
);

export const unfollowUser = createAsyncThunk(
  "users/unfollowUser",
  async (userId: string, { rejectWithValue }) => {
    try {
      await unfollowUserApi(userId);
      return userId;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to unfollow user"
      );
    }
  }
);

const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    clearUserProfile: (state) => {
      state.profile = null;
      state.followers = [];
      state.following = [];
      state.profileStatus = "idle";
      state.followersStatus = "idle";
      state.followingStatus = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch profile
      .addCase(fetchProfile.pending, (state) => {
        state.profileStatus = "loading";
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.profileStatus = "succeeded";
        state.profile = action.payload;
        state.error = null;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.profileStatus = "failed";
        state.error = action.payload as string;
      })

      // Fetch followers
      .addCase(fetchFollowers.pending, (state) => {
        state.followersStatus = "loading";
      })
      .addCase(fetchFollowers.fulfilled, (state, action) => {
        state.followersStatus = "succeeded";
        state.followers = action.payload;
        state.error = null;
      })
      .addCase(fetchFollowers.rejected, (state, action) => {
        state.followersStatus = "failed";
        state.error = action.payload as string;
      })

      // Fetch following
      .addCase(fetchFollowing.pending, (state) => {
        state.followingStatus = "loading";
      })
      .addCase(fetchFollowing.fulfilled, (state, action) => {
        state.followingStatus = "succeeded";
        state.following = action.payload;
        state.error = null;
      })
      .addCase(fetchFollowing.rejected, (state, action) => {
        state.followingStatus = "failed";
        state.error = action.payload as string;
      })

      // Follow user
      .addCase(followUser.pending, (state) => {
        state.followStatus = "loading";
      })
      .addCase(followUser.fulfilled, (state, action) => {
        state.followStatus = "succeeded";

        // Update profile if it's the user we're following
        if (state.profile && state.profile.id === action.payload) {
          state.profile.isFollowing = true;
          state.profile.stats.followersCount += 1;
        }

        // Update in followers list
        const followerIndex = state.followers.findIndex(
          (user) => user.id === action.payload
        );
        if (followerIndex !== -1) {
          state.followers[followerIndex].isFollowing = true;
        }

        // Update in following list
        const followingIndex = state.following.findIndex(
          (user) => user.id === action.payload
        );
        if (followingIndex !== -1) {
          state.following[followingIndex].isFollowing = true;
        }
      })
      .addCase(followUser.rejected, (state, action) => {
        state.followStatus = "failed";
        state.error = action.payload as string;
      })

      // Unfollow user
      .addCase(unfollowUser.pending, (state) => {
        state.followStatus = "loading";
      })
      .addCase(unfollowUser.fulfilled, (state, action) => {
        state.followStatus = "succeeded";

        // Update profile if it's the user we're unfollow
        if (state.profile && state.profile.id === action.payload) {
          state.profile.isFollowing = false;
          state.profile.stats.followersCount -= 1;
        }

        // Update in followers list
        const followerIndex = state.followers.findIndex(
          (user) => user.id === action.payload
        );
        if (followerIndex !== -1) {
          state.followers[followerIndex].isFollowing = false;
        }

        // Update in following list
        const followingIndex = state.following.findIndex(
          (user) => user.id === action.payload
        );
        if (followingIndex !== -1) {
          state.following[followingIndex].isFollowing = false;
        }
      })
      .addCase(unfollowUser.rejected, (state, action) => {
        state.followStatus = "failed";
        state.error = action.payload as string;
      });
  },
});

export const { clearUserProfile } = userSlice.actions;

// Selectors
export const selectUserProfile = (state: RootState) => state.users.profile;
export const selectFollowers = (state: RootState) => state.users.followers;
export const selectFollowing = (state: RootState) => state.users.following;
export const selectProfileStatus = (state: RootState) =>
  state.users.profileStatus;
export const selectFollowersStatus = (state: RootState) =>
  state.users.followersStatus;
export const selectFollowingStatus = (state: RootState) =>
  state.users.followingStatus;
export const selectFollowStatus = (state: RootState) =>
  state.users.followStatus;
export const selectUserError = (state: RootState) => state.users.error;

export default userSlice.reducer;
