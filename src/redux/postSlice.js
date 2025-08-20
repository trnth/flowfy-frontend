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
    setSelectedPost: (state, action) => {
      state.selectedPost = action.payload;
    },
    reset: () => ({ posts: [], selectedPost: null }),
  },
});
export const { setPosts, setSelectedPost, resetPosts } = postSlice.actions;
export default postSlice.reducer;
