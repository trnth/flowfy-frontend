import { combineReducers, configureStore } from "@reduxjs/toolkit";
import authSlice from "./authSlice.js";
import userSlice from "./userSlice.js";
import postSlice from "./postSlice.js";
import socketSlice from "./socketSlice.js";
import chatSlice from "./chatSlice.js";
import notificationSlice from "./notificationSlice.js";
import followSlice from "./followSlice.js";
const rootReducer = combineReducers({
  auth: authSlice,
  user: userSlice,
  post: postSlice,
  socketio: socketSlice,
  chat: chatSlice,
  notification: notificationSlice,
  follow: followSlice,
});

const store = configureStore({
  reducer: rootReducer,
});

export default store;
