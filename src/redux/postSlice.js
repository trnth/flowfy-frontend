import { createSlice } from "@reduxjs/toolkit";

const postSlice = createSlice({
  name: "post",
  initialState: {
    posts: [],
    userPost: [],
    userPostNextCursor: null,
    bookmarks: [],
    bookmarksNextCursor: null,
    selectedPost: null,
    loading: false,
    error: null,
  },
  reducers: {
    setPosts: (state, action) => {
      state.posts = action.payload;
      state.error = null;
    },
    setUserPost: (state, action) => {
      state.userPost = action.payload;
      state.userPostNextCursor = null;
      state.error = null;
    },
    addUserPost: (state, action) => {
      state.userPost = [...state.userPost, ...action.payload];
      state.error = null;
    },
    setUserPostNextCursor: (state, action) => {
      state.userPostNextCursor = action.payload;
    },
    setBookmarks: (state, action) => {
      state.bookmarks = action.payload;
      state.bookmarksNextCursor = null;
      state.error = null;
    },
    addBookmarks: (state, action) => {
      state.bookmarks = [...state.bookmarks, ...action.payload];
      state.error = null;
    },
    setBookmarksNextCursor: (state, action) => {
      state.bookmarksNextCursor = action.payload;
    },
    setSelectedPost: (state, action) => {
      state.selectedPost = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    updatePost: (state, action) => {
      const { postId, updates } = action.payload;
      const postIndex = state.posts.findIndex(post => post._id === postId);
      if (postIndex !== -1) {
        state.posts[postIndex] = { ...state.posts[postIndex], ...updates };
      }
      // Cập nhật selectedPost nếu đang được chọn
      if (state.selectedPost?._id === postId) {
        state.selectedPost = { ...state.selectedPost, ...updates };
      }
    },
    addCommentToPost: (state, action) => {
      const { postId, comment } = action.payload;
      const postIndex = state.posts.findIndex(post => post._id === postId);
      if (postIndex !== -1) {
        state.posts[postIndex].comments = (state.posts[postIndex].comments || 0) + 1;
      }
      if (state.selectedPost?._id === postId) {
        state.selectedPost.comments = (state.selectedPost.comments || 0) + 1;
      }
    },
    reset: (state) => ({
      posts: [],
      userPost: [],
      userPostNextCursor: null,
      bookmarks: [],
      bookmarksNextCursor: null,
      selectedPost: null,
      loading: false,
      error: null,
    }),
  },
});

export const {
  setPosts,
  setUserPost,
  addUserPost,
  setUserPostNextCursor,
  setBookmarks,
  addBookmarks,
  setBookmarksNextCursor,
  setSelectedPost,
  setLoading,
  setError,
  updatePost,
  addCommentToPost,
  reset: resetPost,
} = postSlice.actions;

export default postSlice.reducer;
