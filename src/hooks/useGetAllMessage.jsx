import { addOldMessages, setMessages } from "@/redux/chatSlice";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";

const useGetAllMessage = () => {
  const dispatch = useDispatch();
  const { selectedConversation } = useSelector((store) => store.chat);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const lastConversationIdRef = useRef(null); // Theo dõi conversationId

  const fetchMessages = async (lastMessageCreatedAt = null) => {
    if (!selectedConversation?._id || loading || isFetching) return;
    if (
      lastConversationIdRef.current === selectedConversation._id &&
      !lastMessageCreatedAt
    ) {
      return; // Bỏ qua nếu đã tải tin nhắn cho conversation này
    }
    setLoading(true);
    setIsFetching(true);
    try {
      const res = await axios.get(
        `http://localhost:5000/api/v1/message/${selectedConversation._id}/all`,
        {
          params: { lastMessageCreatedAt },
          withCredentials: true,
        }
      );

      if (res.data.success) {
        const messages = res.data.messages.map((msg) => ({
          ...msg,
          createdAt: new Date(msg.createdAt).toISOString(),
          reply_to_id: msg.reply_to_id
            ? {
                ...msg.reply_to_id,
                createdAt: new Date(msg.reply_to_id.createdAt).toISOString(),
              }
            : null,
        }));
        if (lastMessageCreatedAt) {
          dispatch(addOldMessages(messages));
        } else {
          dispatch(setMessages(messages));
          lastConversationIdRef.current = selectedConversation._id; // Cập nhật conversationId
        }
        setHasMore(res.data.hasMore);
      } else {
        toast.error(res.data.error || "Không thể tải tin nhắn");
      }
    } catch (error) {
      console.error("Lỗi khi tải tin nhắn:", error);
      toast.error(error.response?.data?.error || "Không thể tải tin nhắn");
    } finally {
      setLoading(false);
      setIsFetching(false);
    }
  };

  useEffect(() => {
    if (selectedConversation?._id) {
      fetchMessages();
    }
  }, [selectedConversation?._id]);

  return {
    fetchMoreMessages: (lastCreatedAt) => fetchMessages(lastCreatedAt),
    hasMore,
    loading,
  };
};

export default useGetAllMessage;
