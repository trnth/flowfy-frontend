import { createSlice } from "@reduxjs/toolkit";
import { setSelectedPost } from "./postSlice";
import { act } from "react";
const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    isVerified: false,
  },
  reducers: {
    setAuth: (state, action) => {
      state.user = action.payload;
    },
    setVerified: (state, action) => {
      state.isVerified = action.payload;
    },
    reset: () => ({
      user: null,
      isVerified: false,
    }),
  },
});
export const { setAuth, reset: resetAuth, setVerified } = authSlice.actions;
export default authSlice.reducer;
