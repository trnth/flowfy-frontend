import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isVerified: false,
  loading: true,
  profile: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setVerified: (state, action) => {
      state.isVerified = true;
      state.loading = false;
      state.profile = action.payload;
    },
    setProfile: (state, action) => {
      state.profile = action.payload;
    },
    setUnverified: (state) => {
      state.isVerified = false;
      state.loading = false;
      state.profile = null;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    resetAuth: () => initialState,
  },
});

export const { setVerified, setUnverified, setLoading, resetAuth, setProfile } =
  authSlice.actions;

export default authSlice.reducer;
