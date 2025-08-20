import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { initializeSocket, closeSocket } from "../socket/socket.jsx";
import { setOnlineUsers } from "../redux/chatSlice";
import { setSocketStatus } from "../redux/socketSlice";

const useSocket = (user) => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (!user) return;

    const socket = initializeSocket(user._id);

    socket.on("connect", () => dispatch(setSocketStatus(true)));
    socket.on("getOnlineUsers", (users) => dispatch(setOnlineUsers(users)));
    socket.on("disconnect", () => dispatch(setSocketStatus(false)));

    return () => {
      closeSocket();
      dispatch(setSocketStatus(false));
    };
  }, [user, dispatch]);
};

export default useSocket;
