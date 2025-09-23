import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { MessageCircleCode } from "lucide-react";
import { FaRegEdit } from "react-icons/fa";
import Messages from "./Messages";
import axios from "axios";
import {
  setMessages,
  setSelectedConversation,
  setConversation,
} from "@/redux/chatSlice";
import { toast } from "sonner";

const ChatPage = () => {
  const [textMessage, setTextMessage] = useState("");
  const user = useSelector((store) => store.auth.profile);
  const { conversations, selectedConversation, onlineUsers } = useSelector(
    (store) => store.chat
  );
  const dispatch = useDispatch();

  // Lấy danh sách cuộc trò chuyện khi vào trang
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

  const selectConversationHandler = async (conversation) => {
    if (!conversation?._id) {
      toast.error("Invalid conversation");
      return;
    }
    try {
      dispatch(setSelectedConversation(conversation));
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

  const sendMessageHandler = async (conversationId) => {
    if (!conversationId || !textMessage.trim()) {
      toast.error("Invalid conversation or message");
      return;
    }
    try {
      const res = await axios.post(
        `http://localhost:5000/api/v1/message/${conversationId}/send`,
        { textMessage },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      if (res.data.success) {
        setTextMessage("");
        dispatch(
          setMessages([
            ...(selectedConversation?.messages || []),
            res.data.newMessage,
          ])
        );
      } else {
        toast.error(res.data.error || "Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error(error.response?.data?.error || "Failed to send message");
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
        <hr className="mb-4 border-gray-300" />
        <div className="overflow-y-auto h-[80vh]">
          {conversations?.map((conversation) => {
            const recipient = conversation.isGroup
              ? null
              : conversation.participants?.find((p) => p?._id !== user?._id);
            const isOnline = recipient && onlineUsers?.includes(recipient?._id);
            return (
              <div
                key={conversation._id}
                onClick={() => selectConversationHandler(conversation)}
                className={`flex gap-3 items-center p-3 hover:bg-gray-50 cursor-pointer ${
                  selectedConversation?._id === conversation._id
                    ? "bg-gray-100"
                    : ""
                }`}
              >
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
                <div className="hidden lg:flex lg:flex-col">
                  <span>
                    {conversation.isGroup
                      ? conversation.groupName || "Group"
                      : recipient?.username || "Unknown"}
                  </span>
                  <span
                    className={`text-xs font-bold ${
                      conversation.isGroup
                        ? ""
                        : isOnline
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {conversation.isGroup
                      ? `Group (${conversation.participantsCount || 0} members)`
                      : isOnline
                      ? "online"
                      : "offline"}
                  </span>
                </div>
                {conversation.unread && (
                  <span className="ml-auto bg-blue-500 text-white text-xs rounded-full px-2 py-1">
                    New
                  </span>
                )}
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
          <Messages />
          <div className="flex items-center p-4">
            <Input
              value={textMessage}
              onChange={(e) => setTextMessage(e.target.value)}
              type="text"
              className="flex-1 mr-2 focus-visible:ring-transparent"
              placeholder="Message..."
            />
            {textMessage.trim() && (
              <Button
                onClick={() => sendMessageHandler(selectedConversation._id)}
              >
                Send
              </Button>
            )}
          </div>
        </section>
      ) : (
        <div className="flex flex-col items-center justify-center mx-auto">
          <MessageCircleCode className="w-32 h-32 my-4" />
          <h1 className="font-medium">Your messages</h1>
          <span>Send a message to start a chat.</span>
        </div>
      )}
    </div>
  );
};

export default ChatPage;
