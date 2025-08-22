import { createSlice } from "@reduxjs/toolkit";
import { setSelectedPost } from "./postSlice";
import { act } from "react";
const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    isAuthLoading: true,
    suggestedUsers: [],
    userProfile: null,
    selectedUser: null,
  },
  reducers: {
    setAuthUser: (state, action) => {
      state.user = action.payload;
      state.isAuthLoading = false;
    },
    setSuggestedUsers: (state, action) => {
      state.suggestedUsers = action.payload;
    },
    setUserProfile: (state, action) => {
      state.userProfile = action.payload;
    },
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
    },
    reset: () => ({
      user: null,
      suggestedUsers: [],
      userProfile: null,
      selectedUser: null,
      isAuthLoading: false,
    }),
    startAuthCheck: (state) => {
      state.isAuthLoading = true;
    },
  },
});
export const {
  setAuthUser,
  setSuggestedUsers,
  setUserProfile,
  setSelectedUser,
  reset: resetAuth,
  startAuthCheck
} = authSlice.actions;
export default authSlice.reducer;
