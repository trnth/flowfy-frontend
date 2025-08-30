import { createSlice } from "@reduxjs/toolkit";

const notificationSlice = createSlice({
  name: "notification",
  initialState: {
    notifications: [],
  },
  reducers: {
    setNotification: (state, action) => {
      state.notifications.push(action.payload);
    },
    reset: () => ({
      notifications: [],
    }),
  },
});
export const { setNotification, reset: resetNotification } =
  notificationSlice.actions;
export default notificationSlice.reducer;
