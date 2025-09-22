import store from "@/redux/store";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { MessageCircleCode } from "lucide-react";
import { FaRegEdit } from "react-icons/fa";
import Messages from "./Messages";
import axios from "axios";
import { setMessages } from "@/redux/chatSlice";
const ChatPage = () => {
  const [textMessage, setTextMessage] = useState("");
  const { user, suggestedUsers, selectedUser } = useSelector(
    (store) => store.auth
  );
  const { onlineUsers, messages } = useSelector((store) => store.chat);

  const dispatch = useDispatch();
  const sendMessageHandler = async (receiverId) => {
    try {
      const res = await axios.post(
        `http://localhost:5000/api/v1/message/send/${receiverId}`,
        { textMessage },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      if (res.data.success) {
        setTextMessage("");
        dispatch(setMessages([...messages, res.data.newMessage]));
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="flex md:ml-[80px] h-screen ">
      <section className="w-20 lg:w-[350px] border-r border-gray-300">
        <div className="flex justify-center lg:justify-between items-center">
          <h1 className="font-bold my-4 px-3 text-lg hidden lg:block">
            {user?.username}
          </h1>
          <FaRegEdit className="w-8 h-8 lg:mx-4 my-4" />
        </div>
        <hr className="mb-4 border-gray-300" />
        <div className="overflow-y-auto h-[80vh]">
          {suggestedUsers.map((suggestedUsers) => {
            const isOnline = onlineUsers?.includes(suggestedUsers?._id);
            return (
              <div
                key={suggestedUsers?._id}
                onClick={() => dispatch(setSelectedUser(suggestedUsers))}
                className="flex gap-3 items-center p-3 hover:bg-gray-50 cursor-pointer"
              >
                <Avatar className="w-14 h-14">
                  <AvatarImage
                    src={suggestedUsers?.profilePicture}
                  ></AvatarImage>
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <div className="hidden lg:flex lg:flex-col">
                  <span className="">{suggestedUsers?.username}</span>
                  <span
                    className={`text-xs font-bold ${
                      isOnline ? "text-green-600" : "text-red-600"
                    } `}
                  >
                    {isOnline ? "online" : "offline"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
      {selectedUser ? (
        <section className="flex-1  flex flex-col h-full">
          <div className="flex gap-3 items-center px-3 py-1 border-b border-gray-300 sticky top-0 bg-white z-10">
            <Avatar className="h-14 w-14">
              <AvatarImage src={selectedUser?.profilePicture} />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div className="flex flex-col font-semibold">
              <span>{selectedUser?.username}</span>
            </div>
          </div>
          <Messages selectedUser={selectedUser} />
          <div className="flex items-center p-4 ">
            <Input
              value={textMessage}
              onChange={(e) => setTextMessage(e.target.value)}
              type="text"
              className="flex-1 mr-2 focus-visible:ring-transparent"
              placeholder="Message..."
            />
            {textMessage.trim() ? (
              <Button onClick={() => sendMessageHandler(selectedUser?._id)}>
                Send
              </Button>
            ) : null}
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
