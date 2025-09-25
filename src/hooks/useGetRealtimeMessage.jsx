import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addMessage } from "@/redux/chatSlice";
import useSocket from "./useSocket";

const useGetRealtimeMessage = () => {
  const dispatch = useDispatch();
  const socket = useSocket();
  const { selectedConversation } = useSelector((store) => store.chat);
  const profile = useSelector((store) => store.auth.profile);
  const [newMessage, setNewMessage] = useState(null);

  useEffect(() => {
    if (!socket || !selectedConversation?._id || !profile?._id) return;

    const handleNewMessage = (data) => {
      if (data.sender?._id === profile._id) {
        return; // Bỏ qua tin nhắn của chính mình
      }
      if (data.conversationId === selectedConversation._id) {
        const processedMessage = {
          ...data,
          createdAt: new Date(data.createdAt).toISOString(),
          reply_to_id: data.reply_to_id
            ? {
                ...data.reply_to_id,
                createdAt: new Date(data.reply_to_id.createdAt).toISOString(),
              }
            : null,
        };
        dispatch(addMessage(processedMessage));
        setNewMessage(processedMessage);
      }
    };

    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [socket, dispatch, selectedConversation, profile]);

  return { newMessage };
};

export default useGetRealtimeMessage;
