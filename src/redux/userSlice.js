import { createSlice } from "@reduxjs/toolkit";
import { act } from "react";
const userSlice = createSlice({
  name: "user",
  initialState: {
    suggestedUsers: [],
    userProfile: null,
    selectedUser: null,
    userPost: [],
    bookmarks: [],
  },
  reducers: {
    setSuggestedUsers: (state, action) => {
      state.suggestedUsers = action.payload;
    },
    setUserProfile: (state, action) => {
      state.userProfile = action.payload;
    },
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
    },
    setUserPost: (state, action) => {
      state.userPost = action.payload;
    },
    addUserPost: (state, action) => {
      state.userPost = [...state.userPost, ...action.payload];
    },
    resetUserPost: (state) => {
      state.userPost = [];
    },
    setBookmarks: (state, action) => {
      state.bookmarks = action.payload;
    },
    addBookmarks: (state, action) => {
      state.bookmarks = [...state.bookmarks, ...action.payload];
    },
    resetBookmarks: (state) => {
      state.bookmarks = [];
    },
    reset: () => ({
      suggestedUsers: [],
      userProfile: null,
      selectedUser: null,
      userPost: [],
      bookmarks: [],
    }),
  },
});
export const {
  setSuggestedUsers,
  setUserProfile,
  setSelectedUser,
  reset: resetUser,
  resetBookmarks,
  resetUserPost,
  setUserPost,
  addUserPost,
  setBookmarks,
  addBookmarks,
} = userSlice.actions;
export default userSlice.reducer;
