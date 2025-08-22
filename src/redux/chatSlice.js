import { createSlice } from "@reduxjs/toolkit";
const chatSlice = createSlice({
  name: "chat",
  initialState: {
    onlineUsers: [],
    messages: [],
  },
  reducers: {
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
    },
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    reset: () => ({ onlineUsers: [], messages: [] }),
  },
});
export const {
  setOnlineUsers,
  setMessages,
  addMessage,
  reset: resetChat,
} = chatSlice.actions;
export default chatSlice.reducer;
