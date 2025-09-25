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
      state.messages = action.payload; // Backend trả newest -> oldest
    },
    addMessage: (state, action) => {
      state.messages.unshift(action.payload); // Thêm tin mới vào đầu (newest)
    },
    removeMessage: (state, action) => {
      state.messages = state.messages.filter(
        (msg) => msg._id !== action.payload
      );
    },
    reset: () => ({
      conversations: [],
      messages: [],
      selectedConversation: null,
    }),
    addOldMessages: (state, action) => {
      const newMessages = action.payload
        .filter(
          (newMsg) =>
            !state.messages.some(
              (msg) =>
                msg._id === newMsg._id && msg.createdAt === newMsg.createdAt
            )
        )
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Sắp xếp newest -> oldest
      state.messages = [...state.messages, ...newMessages]; // Append tin cũ vào cuối
    },
  },
});

export const {
  setMessages,
  addMessage,
  removeMessage,
  setSelectedConversation,
  setConversation,
  addConversations,
  addOldMessages,
  reset: resetChat,
} = chatSlice.actions;
export default chatSlice.reducer;
