import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import useSocket from "./useSocket";
import store from "@/redux/store";
import { addMessage, setMessages } from "@/redux/chatSlice";

const useGetRealtimeMessage = () => {
  const dispatch = useDispatch();
  const socket = useSocket();
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMessage) => {
      dispatch(addMessage(newMessage));
    };

    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [socket, dispatch]);
};

export default useGetRealtimeMessage;
