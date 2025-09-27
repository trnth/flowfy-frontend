import { createSlice } from "@reduxjs/toolkit";

const notificationSlice = createSlice({
  name: "notification",
  initialState: {
    notifications: [],
  },
  reducers: {
    setNotification: (state, action) => {
      // Kiểm tra xem notification đã tồn tại chưa để tránh duplicate
      const existingIndex = state.notifications.findIndex(
        (n) => n._id === action.payload._id
      );
      if (existingIndex === -1) {
        state.notifications.unshift(action.payload);
      }
    },
    markAsRead: (state, action) => {
      const notificationId = action.payload;
      const notification = state.notifications.find(
        (n) => n && n._id === notificationId
      );
      if (notification) {
        notification.isRead = true;
      }
    },
    markAllAsRead: (state) => {
      state.notifications.forEach((notification) => {
        if (notification) {
          notification.isRead = true;
        }
      });
    },
    removeNotification: (state, action) => {
      const notificationId = action.payload;
      state.notifications = state.notifications.filter(
        (n) => n._id !== notificationId
      );
    },
    reset: () => ({
      notifications: [],
    }),
  },
});
export const {
  setNotification,
  markAsRead,
  markAllAsRead,
  removeNotification,
  reset: resetNotification,
} = notificationSlice.actions;
export default notificationSlice.reducer;
