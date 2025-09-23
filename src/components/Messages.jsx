import React, { useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { useSelector } from "react-redux";
import useGetAllMessage from "@/hooks/useGetAllMessage";
import useGetRealtimeMessage from "@/hooks/useGetRealtimeMessage";

const Messages = () => {
  const user = useSelector((store) => store.auth.profile);
  const { selectedConversation, messages } = useSelector((store) => store.chat);
  useGetAllMessage();
  useGetRealtimeMessage();
  const containerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const atBottom = scrollHeight - scrollTop <= clientHeight + 10;
    setIsAtBottom(atBottom);
  };

  useEffect(() => {
    if (isAtBottom && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isAtBottom]);

  if (!selectedConversation) return null;

  const recipient = selectedConversation.isGroup
    ? null
    : selectedConversation.participants.find((p) => p._id !== user._id);

  return (
    <div
      className="overflow-auto flex-1 p-4"
      ref={containerRef}
      onScroll={handleScroll}
    >
      <div className="flex justify-center">
        <div className="flex flex-col items-center justify-center">
          <Link to={`/profile/${recipient?._id}`}>
            <Avatar className="h-20 w-20">
              <AvatarImage
                className="h-20 w-20"
                src={
                  selectedConversation.isGroup
                    ? selectedConversation.groupPicture
                    : recipient?.profilePicture
                }
                alt="profile"
              />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </Link>
          <span>
            {selectedConversation.isGroup
              ? selectedConversation.groupName
              : recipient?.username}
          </span>
          <Link to={`/profile/${recipient?._id}`} className="h-8 my-2">
            {selectedConversation.isGroup ? null : (
              <Button>View Profile</Button>
            )}
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {messages &&
          messages.map((msg) => {
            const isOwnMessage = msg.sender?._id === user?._id;
            const repliedMessage = msg.reply_to_id;
            return (
              <div
                key={msg._id}
                className={`flex ${
                  isOwnMessage ? "justify-end" : "justify-start"
                }`}
              >
                <div className="flex flex-col max-w-xs">
                  {repliedMessage && (
                    <div
                      className={`p-2 rounded-lg mb-1 ${
                        isOwnMessage
                          ? "bg-gray-100 text-black border-l-4 border-blue-500"
                          : "bg-gray-100 text-black border-l-4 border-gray-500"
                      }`}
                    >
                      <p className="text-xs font-semibold">
                        {repliedMessage.sender?.username || "System"}
                      </p>
                      <p className="text-xs truncate">{repliedMessage.text}</p>
                    </div>
                  )}
                  <div
                    className={`p-2 rounded-lg break-words ${
                      isOwnMessage
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-black"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              </div>
            );
          })}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default Messages;
