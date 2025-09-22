import { createSlice } from "@reduxjs/toolkit";

const followSlice = createSlice({
  name: "follow",
  initialState: {
    followers: [],
    following: [],
    followersNextCursor: null,
    followingNextCursor: null,
    loading: false,
    error: null,
  },
  reducers: {
    setFollowers(state, action) {
      state.followers = action.payload.followers;
      state.followersNextCursor = action.payload.nextCursor;
    },
    addFollowers(state, action) {
      state.followers = [...state.followers, ...action.payload.followers];
      state.followersNextCursor = action.payload.nextCursor;
    },
    resetFollowers(state) {
      state.followers = [];
      state.followersNextCursor = null;
    },
    setFollowing(state, action) {
      state.following = action.payload.following;
      state.followingNextCursor = action.payload.nextCursor;
    },
    addFollowing(state, action) {
      state.following = [...state.following, ...action.payload.following];
      state.followingNextCursor = action.payload.nextCursor;
    },
    resetFollowing(state) {
      state.following = [];
      state.followingNextCursor = null;
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
    setError(state, action) {
      state.error = action.payload;
    },
    removeFollower(state, action) {
      const userId = action.payload;
      state.followers = state.followers.filter(
        (follow) => follow.follower._id !== userId
      );
    },
    removeFollowing(state, action) {
      const userId = action.payload;
      state.following = state.following.filter(
        (follow) => follow.following._id !== userId
      );
    },
  },
});

export const {
  setFollowers,
  addFollowers,
  resetFollowers,
  setFollowing,
  addFollowing,
  resetFollowing,
  setLoading,
  setError,
  removeFollower,
  removeFollowing,
} = followSlice.actions;

export default followSlice.reducer;
