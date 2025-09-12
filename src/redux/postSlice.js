import { createSlice } from "@reduxjs/toolkit";

const postSlice = createSlice({
  name: "post",
  initialState: {
    posts: [],
    userPost: [],
    bookmarks: [],
    selectedPost: null,
  },
  reducers: {
    setPosts: (state, action) => {
      state.posts = action.payload;
    },
    setSelectedPost: (state, action) => {
      state.selectedPost = action.payload;
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
      posts: [],
      userPost: [],
      selectedPost: null,
      bookmarks: [],
    }),
  },
});

export const {
  setPosts,
  setSelectedPost,
  resetBookmarks,
  resetUserPost,
  setUserPost,
  addUserPost,
  setBookmarks,
  addBookmarks,
  reset: resetPosts,
} = postSlice.actions;

export default postSlice.reducer;
