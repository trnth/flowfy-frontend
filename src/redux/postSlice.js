import { createSlice } from "@reduxjs/toolkit";

const postSlice = createSlice({
  name: "post",
  initialState: {
    posts: [],
    selectedPost: null,
  },
  reducers: {
    setPosts: (state, action) => {
      state.posts = action.payload;
    },
    resetPosts: (state) => {
      state.posts = [];
      state.selectedPost = null;
    },

    setSelectedPost: (state, action) => {
      state.selectedPost = action.payload;
    },
  },
});

export const { setPosts, resetPosts, setSelectedPost } = postSlice.actions;

export default postSlice.reducer;
