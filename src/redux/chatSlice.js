import { createSlice } from "@reduxjs/toolkit";
const chatSlice = createSlice({
  name: "chat",
  initialState: {
    onlineUsers: null,
  },
  reducers: {
    setOnlineUsers: (state, action) => {
      state.socket = action.payload;
    },
  },
});
export const { setOnlineUsers } = chatSlice.actions;
export default chatSlice.reducer;
