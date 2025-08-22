import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { useSelector } from "react-redux";
import store from "@/redux/store";
import useGetAllMessage from "@/hooks/useGetAllMessage";

const Messages = () => {
  const { user, selectedUser } = useSelector((store) => store.auth);
  useGetAllMessage();
  const { messages } = useSelector((store) => store.chat);
  return (
    <div className="overflow-auto flex-1 p-4">
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
                  msg.senderId === user?._id ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`p-2 rounded-lg max-w-xs break-words ${
                    msg.senderId === user?._id
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-black"
                  }`}
                >
                  {msg.message}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default Messages;
