import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useSelector, useDispatch } from "react-redux";
import { setOnlineUsers } from "@/redux/chatSlice";
import { setSocketStatus } from "@/redux/socketSlice";
import { setNotification } from "@/redux/notificationSlice";

const useSocket = () => {
  const { user, isVerified } = useSelector((store) => store.auth);
  const dispatch = useDispatch();
  const socketRef = useRef(null);

  useEffect(() => {
    if (isVerified && user?._id) {
      const socket = io("http://localhost:5000", {
        query: { userId: user._id },
        withCredentials: true,
        transports: ["websocket"],
      });

      socketRef.current = socket;
      dispatch(setSocketStatus(true));

      socket.on("connect", () => console.log("Socket connected:", socket.id));
      socket.on("disconnect", () => {
        console.log("Socket disconnected");
        dispatch(setSocketStatus(false));
      });

      socket.on("getOnlineUsers", (onlineUsers) => {
        dispatch(setOnlineUsers(onlineUsers));
      });

      socket.on("notification", (notification) => {
        dispatch(setNotification(notification));
      });
      return () => {
        socket.disconnect();
        dispatch(setSocketStatus(false));
      };
    }
  }, [isVerified, user?._id, dispatch]);

  return socketRef.current;
};

export default useSocket;
