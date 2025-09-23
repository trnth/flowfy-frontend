import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addMessage } from "@/redux/chatSlice";
import useSocket from "./useSocket";

const useGetRealtimeMessage = () => {
  const dispatch = useDispatch();
  const socket = useSocket();
  const { selectedConversation } = useSelector((store) => store.chat);

  useEffect(() => {
    if (!socket || !selectedConversation?._id) return;

    const handleNewMessage = (newMessage) => {
      if (newMessage.conversationId === selectedConversation._id) {
        dispatch(addMessage(newMessage));
      }
    };

    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [socket, dispatch, selectedConversation]);
};

export default useGetRealtimeMessage;
