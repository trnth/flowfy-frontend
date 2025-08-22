import React, { useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { useSelector } from "react-redux";
import useGetAllMessage from "@/hooks/useGetAllMessage";
import useGetRealtimeMessage from "@/hooks/useGetRealtimeMessage";

const Messages = () => {
  const { user, selectedUser } = useSelector((store) => store.auth);
  useGetRealtimeMessage();
  useGetAllMessage();
  const { messages } = useSelector((store) => store.chat);

  const containerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const atBottom = scrollHeight - scrollTop <= clientHeight + 10; // 10px tolerance
    setIsAtBottom(atBottom);
  };

  useEffect(() => {
    if (isAtBottom && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isAtBottom]);

  return (
    <div
      className="overflow-auto flex-1 p-4"
      ref={containerRef}
      onScroll={handleScroll}
    >
      <div className="flex justify-center">
        <div className="flex flex-col items-center justify-center">
          <Link to={`/profile/${selectedUser?._id}`}>
            <Avatar className="h-20 w-20">
              <AvatarImage
                className="h-20 w-20"
                src={selectedUser?.profilePicture}
                alt="profile"
              />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </Link>
          <span>{selectedUser?.username}</span>
          <Link to={`/profile/${selectedUser?._id}`} className="h-8 my-2">
            <Button>View Profile</Button>
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {messages &&
          messages.map((msg) => {
            const isOwnMessage = msg.senderId === user?._id;
            return (
              <div
                key={msg._id}
                className={`flex ${
                  isOwnMessage ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`p-2 rounded-lg max-w-xs break-words ${
                    isOwnMessage
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-black"
                  }`}
                >
                  {msg.message}
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
