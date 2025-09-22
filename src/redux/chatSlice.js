import { createSlice } from "@reduxjs/toolkit";
const chatSlice = createSlice({
  name: "chat",
  initialState: {
    conversations: [],
    messages: [],
    selectedConversation: null,
  },
  reducers: {
    setSelectedConversation: (state, action) => {
      state.selectedConversation = action.payload;
    },
    setConversation: (state, action) => {
      state.conversations = action.payload;
    },
    addConversations: (state, action) => {
      state.conversations.push(action.payload);
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
  setMessages,
  addMessage,
  setSelectedConversation,
  reset: resetChat,
} = chatSlice.actions;
export default chatSlice.reducer;
