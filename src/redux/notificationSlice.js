import { createSlice } from "@reduxjs/toolkit";

const notificationSlice = createSlice({
  name: "notification",
  initialState: {
    likeNotifications: [],
  },
  reducers: {
    setLikeNotification: (state, action) => {
      state.likeNotifications.push(action.payload);
    },
    reset: () => ({
      likeNotifications: [],
    }),
  },
});
export const { setLikeNotification, reset: resetNotification } =
  notificationSlice.actions;
export default notificationSlice.reducer;
