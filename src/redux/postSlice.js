import { createSlice } from "@reduxjs/toolkit";
const postSlice = createSlice({
  name: "post",
  initialState: {
    posts: [],
    userPost: [],
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
    resetUserPost: () => ({
      userPost: [],
    }),
    reset: () => ({ posts: [], selectedPost: null }),
  },
});
export const {
  setPosts,
  setSelectedPost,
  resetUserPost,
  reset: resetPosts,
} = postSlice.actions;
export default postSlice.reducer;
