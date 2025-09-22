import { createSlice } from "@reduxjs/toolkit";
import { act } from "react";
const userSlice = createSlice({
  name: "user",
  initialState: {
    suggestedUsers: [],
    userProfile: null,
    onlineUsers: [],
    isCurrentUser: false,
  },
  reducers: {
    setSuggestedUsers: (state, action) => {
      state.suggestedUsers = action.payload;
    },
    setUserProfile: (state, action) => {
      state.userProfile = action.payload;
      state.isCurrentUser = false;
    },
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
    },
    setIsCurrentUser: (state, action) => {
      state.isCurrentUser = action.payload;
    },
    updateUserProfile: (state, action) => {
      state.userProfile = {
        ...state.userProfile,
        ...action.payload,
      };
    },
    reset: () => ({
      suggestedUsers: [],
      userProfile: null,
      onlineUsers: [],
    }),
  },
});
export const {
  setSuggestedUsers,
  setUserProfile,
  setOnlineUsers,
  setIsCurrentUser,
  reset: resetUser,
  updateUserProfile,
} = userSlice.actions;
export default userSlice.reducer;
