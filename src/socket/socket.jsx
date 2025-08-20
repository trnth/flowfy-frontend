import { io } from "socket.io-client";
let socket = null;

export const initializeSocket = (userId) => {
  if (!socket) {
    socket = io("http://localhost:5000", {
      query: { userId },
      transports: ["websocket"],
    });
  }
  return socket;
};

export const getSocket = () => socket;

export const closeSocket = () => {
  if (socket) {
    socket.close();
    socket = null;
  }
};
