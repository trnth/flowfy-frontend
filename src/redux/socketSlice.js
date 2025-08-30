import { createSlice } from "@reduxjs/toolkit";

const socketSlice = createSlice({
  name: "socketio",
  initialState: {
    isConnected: false,
  },
  reducers: {
    setSocketStatus: (state, action) => {
      state.isConnected = action.payload;
    },
    reset: () => ({ isConnected: false }),
  },
});

export const { setSocketStatus, reset: resetSocket } = socketSlice.actions;
export default socketSlice.reducer;
