import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addMessage } from "@/redux/chatSlice";
import useSocket from "./useSocket";

const useGetRealtimeMessage = () => {
  const dispatch = useDispatch();
  const socket = useSocket();
  const { selectedConversation } = useSelector((store) => store.chat);
  const profile = useSelector((store) => store.auth.profile);
  useEffect(() => {
    if (!socket || !selectedConversation?._id) return;
    const handleNewMessage = (newMessage) => {
      if (newMessage.sender?._id === user?._id) {
        console.log("Skipping own message:", data.message._id);
        return;
      }
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
