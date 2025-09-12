import { createSlice } from "@reduxjs/toolkit";
import { act } from "react";
const userSlice = createSlice({
  name: "user",
  initialState: {
    suggestedUsers: [],
    userProfile: null,
    selectedUser: null,
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

    reset: () => ({
      suggestedUsers: [],
      userProfile: null,
      selectedUser: null,
    }),
  },
});
export const {
  setSuggestedUsers,
  setUserProfile,
  setSelectedUser,
  reset: resetUser,
  
} = userSlice.actions;
export default userSlice.reducer;
