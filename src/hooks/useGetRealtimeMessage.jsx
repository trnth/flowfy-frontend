import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addMessage, setConversation, setSelectedConversation } from "@/redux/chatSlice";
import useSocket from "./useSocket";

const useGetRealtimeMessage = () => {
  const dispatch = useDispatch();
  const socket = useSocket();
  const { selectedConversation, conversations } = useSelector((store) => store.chat);
  const profile = useSelector((store) => store.auth.profile);
  const [newMessage, setNewMessage] = useState(null);
  const lastConvUpdateRef = useState(() => ({}))[0]; // { [conversationId]: ms }

  useEffect(() => {
    if (!socket || !selectedConversation?._id || !profile?._id) return;

    const handleNewMessage = (data) => {
      console.log("[realtime] client:newMessage", {
        conversationId: data.conversationId,
        messageId: data._id,
        from: data.sender?._id,
        selectedConversation: selectedConversation._id,
      });
      // Cập nhật danh sách hội thoại (lastMessage, unread)
      if (Array.isArray(conversations) && conversations.length) {
        const incomingTs = new Date(data.createdAt || 0).getTime();
        const lockTs = lastConvUpdateRef[data.conversationId] || 0;
        if (incomingTs && lockTs && incomingTs < lockTs) {
          console.log("[rt] skip stale newMessage by lock", { incomingTs, lockTs });
        } else {
        const updated = conversations.map((c) => {
          if (c._id !== data.conversationId) return c;
          const isOwn = data.sender?._id === profile._id;
            // Chỉ ghi đè lastMessage nếu mới hơn
          const incomingTs = new Date(data.createdAt || 0).getTime();
          const currentTs = new Date(c.lastMessage?.createdAt || c.updatedAt || 0).getTime();
          const nextLastMessage = incomingTs >= currentTs
            ? {
                _id: data._id,
                text: data.text,
                type: data.type,
                event: data.event,
                sender: data.sender,
                createdAt: data.createdAt,
              }
            : c.lastMessage;
          return {
            ...c,
            lastMessage: nextLastMessage,
            // Nếu không phải của mình và không ở trong phòng => unread true
            unread: !isOwn && selectedConversation?._id !== c._id,
          };
        });
        const sorted = [...updated].sort((a, b) => {
          const at = new Date(a.lastMessage?.createdAt || a.updatedAt || 0).getTime();
          const bt = new Date(b.lastMessage?.createdAt || b.updatedAt || 0).getTime();
          return bt - at;
        });
        dispatch(setConversation(sorted));
          if (incomingTs) lastConvUpdateRef[data.conversationId] = incomingTs;
        }
      }

      if (data.sender?._id === profile._id) {
        return; // Bỏ qua phần thêm vào khung chat nếu là của chính mình
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
    const handleConversationUpdated = (payload) => {
      console.log("[realtime] client:conversationUpdated", payload);
      const { conversationId } = payload || {};
      if (!conversationId) return;

      // Merge vào conversations
      if (Array.isArray(conversations) && conversations.length) {
        const incomingTs = new Date(payload.lastMessage?.createdAt || payload.updatedAt || 0).getTime();
        const lockTs = lastConvUpdateRef[conversationId] || 0;
        if (incomingTs && lockTs && incomingTs < lockTs) {
          console.log("[rt] skip stale conversationUpdated by lock", { incomingTs, lockTs });
          return;
        }
        const merged = conversations.map((c) => {
          if (c._id !== conversationId) return c;
          // Bảo toàn lastMessage mới nhất
          const incomingTs = new Date(payload.lastMessage?.createdAt || payload.updatedAt || 0).getTime();
          const currentTs = new Date(c.lastMessage?.createdAt || c.updatedAt || 0).getTime();
          const nextLastMessage = incomingTs >= currentTs && payload.lastMessage ? payload.lastMessage : c.lastMessage;
          return {
            ...c,
            lastRead: payload.lastRead ?? c.lastRead,
            unread: typeof payload.unread === "boolean" ? payload.unread : c.unread,
            lastMessage: nextLastMessage,
            participantsCount: payload.participantsCount || c.participantsCount,
            groupPicture: payload.groupPicture || c.groupPicture,
            updatedAt: payload.updatedAt || c.updatedAt,
          };
        });
        const sorted = [...merged].sort((a, b) => {
          const at = new Date(a.lastMessage?.createdAt || a.updatedAt || 0).getTime();
          const bt = new Date(b.lastMessage?.createdAt || b.updatedAt || 0).getTime();
          return bt - at;
        });
        dispatch(setConversation(sorted));
        if (incomingTs) lastConvUpdateRef[conversationId] = incomingTs;
      }

      // Nếu đang mở đúng conversation, đồng bộ selectedConversation
      if (selectedConversation?._id === conversationId) {
        const nextSelected = {
          ...selectedConversation,
          lastRead: payload.lastRead ?? selectedConversation.lastRead,
          lastMessage: payload.lastMessage || selectedConversation.lastMessage,
          participantsCount: payload.participantsCount || selectedConversation.participantsCount,
          groupPicture: payload.groupPicture || selectedConversation.groupPicture,
          updatedAt: payload.updatedAt || selectedConversation.updatedAt,
        };
        dispatch(setSelectedConversation(nextSelected));
      }
    };
    socket.on("conversationUpdated", handleConversationUpdated);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("conversationUpdated", handleConversationUpdated);
    };
  }, [socket, dispatch, selectedConversation, profile]);

  return { newMessage };
};

export default useGetRealtimeMessage;
