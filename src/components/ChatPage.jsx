import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { FaRegEdit } from "react-icons/fa";
import { MessageCircleCode, RotateCw } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import Messages from "./Messages";
import axios from "axios";
import {
  setMessages,
  setSelectedConversation,
  setConversation,
  addMessage,
  removeMessage,
} from "@/redux/chatSlice";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

const ChatPage = () => {
  const user = useSelector((store) => store.auth.profile);
  const { conversations, selectedConversation, onlineUsers } = useSelector(
    (store) => store.chat
  );
  const dispatch = useDispatch();

  const [textMessage, setTextMessage] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [messageStatus, setMessageStatus] = useState(null);
  const [tempMessageId, setTempMessageId] = useState(null);

  /** 🔹 Refs quản lý last read */
  const lastReadMessageIdRef = useRef(null);
  const lastConversationIdRef = useRef(null);

  useEffect(() => {
    console.log("onlineUsers:", onlineUsers);
  }, [onlineUsers]);

  /** 🔹 Load tất cả conversation khi mở trang */
  useEffect(() => {
    const fetchConversations = async () => {
      if (!user?._id) {
        toast.error("User not authenticated");
        return;
      }
      try {
        const res = await axios.get(
          "http://localhost:5000/api/v1/message/all",
          {
            withCredentials: true,
          }
        );
        if (res.data.success) {
          dispatch(setConversation(res.data.conversations));
        } else {
          toast.error(res.data.error || "Failed to load conversations");
        }
      } catch (error) {
        console.error("Error fetching conversations:", error);
        toast.error(
          error.response?.data?.error || "Failed to load conversations"
        );
      }
    };
    fetchConversations();
  }, [dispatch, user]);

  /** 🔹 Chọn conversation và load tin nhắn */
  const selectConversationHandler = async (conversation) => {
    if (!conversation?._id) {
      toast.error("Invalid conversation");
      return;
    }
    try {
      dispatch(setSelectedConversation(conversation));

      // Reset lastRead refs khi đổi conversation
      lastReadMessageIdRef.current = null;
      lastConversationIdRef.current = null;

      const res = await axios.get(
        `http://localhost:5000/api/v1/message/${conversation._id}/all`,
        { withCredentials: true }
      );
      if (res.data.success) {
        dispatch(setMessages(res.data.messages));
      } else {
        toast.error(res.data.error || "Failed to load messages");
      }
    } catch (error) {
      console.error("Error selecting conversation:", error);
      toast.error(error.response?.data?.error || "Failed to load messages");
    }
  };

  /** 🔹 Cập nhật trạng thái unread */
  const updateConversationUnread = (conversationId) => {
    const updatedConversations = conversations.map((conv) =>
      conv._id === conversationId ? { ...conv, unread: false } : conv
    );
    dispatch(setConversation(updatedConversations));
  };

  const truncateMessage = (text, maxLength = 25) => {
    if (!text) return "";
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
  };

  /** 🔹 Gửi tin nhắn */
  const handleSendMessage = async (
    text = textMessage,
    replyToId = replyingTo?._id
  ) => {
    if (!text.trim() || !selectedConversation?._id) {
      toast.error("Invalid message or conversation");
      return;
    }
    setMessageStatus("pending");
    const tempId = `temp-${Date.now()}`;
    const tempMessage = {
      _id: tempId,
      sender: {
        _id: user._id,
        username: user.username,
        profilePicture: user.profilePicture,
      },
      text,
      conversationId: selectedConversation._id,
      createdAt: new Date().toISOString(),
      reply_to_id: replyToId || null,
      isTemp: true,
    };
    setTempMessageId(tempId);
    dispatch(addMessage(tempMessage));

    try {
      const res = await axios.post(
        `http://localhost:5000/api/v1/message/${selectedConversation._id}/send`,
        {
          textMessage: text,
          replyToId: replyToId || null,
        },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      if (res.status === 201 && res.data?.success === true) {
        const processedNewMessage = {
          ...res.data.newMessage,
          createdAt: new Date(res.data.newMessage.createdAt).toISOString(),
          reply_to_id: res.data.newMessage.reply_to_id
            ? {
                ...res.data.newMessage.reply_to_id,
                createdAt: new Date(
                  res.data.newMessage.reply_to_id.createdAt
                ).toISOString(),
              }
            : null,
        };
        setMessageStatus("sent");
        dispatch(removeMessage(tempId));
        dispatch(addMessage(processedNewMessage));

        const updatedConversations = conversations.map((conv) =>
          conv._id === selectedConversation._id
            ? { ...conv, lastMessage: processedNewMessage, unread: false }
            : conv
        );
        dispatch(setConversation(updatedConversations));
        setTextMessage("");
        setReplyingTo(null);
        setTempMessageId(null);

        return processedNewMessage;
      } else {
        setMessageStatus("failed");
        toast.error(res.data?.error || "Failed to send message");
        return null;
      }
    } catch (error) {
      console.error("Send message error:", error);
      setMessageStatus("failed");
      toast.error(error.response?.data?.error || "Failed to send message");
      return null;
    }
  };

  /** 🔹 Gửi tin nhắn & mark read */
  const handleSendMessageWithRead = async (messageText) => {
    try {
      const newMessage = await handleSendMessage(messageText);
      if (newMessage?._id && selectedConversation?._id) {
        if (
          lastReadMessageIdRef.current !== newMessage._id ||
          lastConversationIdRef.current !== selectedConversation._id
        ) {
          await axios.post(
            `http://localhost:5000/api/v1/message/${selectedConversation._id}/read`,
            { lastMessageId: newMessage._id },
            { withCredentials: true }
          );
          lastReadMessageIdRef.current = newMessage._id;
          lastConversationIdRef.current = selectedConversation._id;
          updateConversationUnread(selectedConversation._id);
        }
      }
    } catch (err) {
      console.error("Error sending message or marking read:", err);
    }
  };

  const handleRetrySend = async () => {
    if (tempMessageId) {
      dispatch(removeMessage(tempMessageId));
      setTempMessageId(null);
    }
    await handleSendMessage();
  };

  const cancelReplyHandler = () => {
    setReplyingTo(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessageWithRead(textMessage);
    }
  };

  return (
    <div className="flex md:ml-[80px] h-screen">
      <section className="w-20 lg:w-[350px] border-r border-gray-300">
        <div className="flex justify-center lg:justify-between items-center">
          <h1 className="font-bold my-4 px-3 text-lg hidden lg:block">
            {user?.username || "User"}
          </h1>
          <FaRegEdit className="w-8 h-8 lg:mx-4 my-4" />
        </div>
        <hr className="border-gray-300" />
        <div className="overflow-y-auto h-[80vh]">
          {conversations?.map((conversation) => {
            const recipient = conversation.isGroup
              ? null
              : conversation.participants?.find((p) => p?._id !== user?._id);
            const isOnline = recipient && onlineUsers?.includes(recipient?._id);
            const lastMessage = conversation.lastMessage;
            const senderName =
              lastMessage?.sender?._id === user?._id
                ? "Bạn"
                : lastMessage?.sender?.username || "System";
            const timeAgo = lastMessage?.createdAt
              ? formatDistanceToNow(new Date(lastMessage.createdAt), {
                  addSuffix: false,
                  locale: vi,
                })
              : "";
            return (
              <div
                key={conversation._id}
                onClick={() => selectConversationHandler(conversation)}
                className={`flex gap-3 items-center p-3 hover:bg-gray-50 cursor-pointer ${
                  selectedConversation?._id === conversation._id
                    ? "bg-gray-100"
                    : ""
                } ${conversation.unread ? "font-bold" : ""}`}
              >
                <div className="relative">
                  <Avatar className="w-14 h-14">
                    <AvatarImage
                      src={
                        conversation.isGroup
                          ? conversation.groupPicture || ""
                          : recipient?.profilePicture || ""
                      }
                    />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                  {!conversation.isGroup && (
                    <span
                      className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ${
                        isOnline ? "bg-green-600" : "bg-red-600"
                      }`}
                    ></span>
                  )}
                </div>
                <div className="hidden lg:flex lg:flex-col flex-1">
                  <div className="flex justify-between items-center">
                    <span>
                      {conversation.isGroup
                        ? conversation.groupName || "Group"
                        : recipient?.username || "Unknown"}
                    </span>
                    {conversation.unread && (
                      <span className="ml-auto bg-blue-500 text-white text-xs rounded-full px-2 py-1">
                        New
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">
                    {conversation.isGroup
                      ? `Group (${conversation.participantsCount || 0} members)`
                      : ""}
                  </span>
                  {lastMessage && (
                    <span className="text-xs text-gray-600 truncate">
                      Từ {senderName}: {truncateMessage(lastMessage.text)} (
                      {timeAgo})
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {selectedConversation && user ? (
        <section className="flex-1 flex flex-col h-full">
          <div className="flex gap-3 items-center px-3 py-1 border-b border-gray-300 sticky top-0 bg-white z-10">
            <Avatar className="h-14 w-14">
              <AvatarImage
                src={
                  selectedConversation.isGroup
                    ? selectedConversation.groupPicture || ""
                    : selectedConversation.participants?.find(
                        (p) => p?._id !== user?._id
                      )?.profilePicture || ""
                }
              />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div className="flex flex-col font-semibold">
              <span>
                {selectedConversation.isGroup
                  ? selectedConversation.groupName || "Group"
                  : selectedConversation.participants?.find(
                      (p) => p?._id !== user?._id
                    )?.username || "Unknown"}
              </span>
              {selectedConversation.isGroup && (
                <span className="text-xs text-gray-500">
                  {selectedConversation.participantsCount || 0} members
                </span>
              )}
            </div>
          </div>

          <Messages
            updateConversationUnread={updateConversationUnread}
            setReplyingTo={setReplyingTo}
            handleSendMessage={handleSendMessage}
            handleSendMessageWithRead={handleSendMessageWithRead}
            handleRetrySend={handleRetrySend}
          />

          <div className="sticky bottom-0 bg-white border-t border-gray-300 p-4 z-10">
            {replyingTo && (
              <div className="flex items-center p-2 bg-gray-100 rounded mb-2 min-w-0">
                <span className="text-sm text-gray-600 mr-2 shrink-0">
                  Đang trả lời {replyingTo.sender?.username || "System"}:
                </span>
                <span className="text-sm truncate flex-1 min-w-0">
                  {replyingTo.text}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-2 shrink-0"
                  onClick={cancelReplyHandler}
                >
                  Hủy
                </Button>
              </div>
            )}
            <div className="flex items-center w-full gap-2">
              <div className="flex-1 min-w-0">
                <Input
                  value={textMessage}
                  onChange={(e) => setTextMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  type="text"
                  className="w-full focus-visible:ring-transparent"
                  placeholder="Nhập tin nhắn..."
                />
              </div>
              {textMessage.trim() && (
                <Button
                  onClick={() => handleSendMessageWithRead(textMessage)}
                  disabled={messageStatus === "pending"}
                >
                  Gửi
                </Button>
              )}
              {messageStatus === "failed" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRetrySend}
                  className="p-0 h-auto"
                >
                  <RotateCw className="w-4 h-4" /> Thử lại
                </Button>
              )}
            </div>
          </div>
        </section>
      ) : (
        <div className="flex flex-col items-center justify-center mx-auto">
          <MessageCircleCode className="w-32 h-32 my-4" />
          <h1 className="font-medium">Tin nhắn của bạn</h1>
          <span>Gửi tin nhắn để bắt đầu trò chuyện.</span>
        </div>
      )}
    </div>
  );
};

export default ChatPage;
