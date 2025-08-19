import store from "@/redux/store";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { setSelectedUser } from "@/redux/authSlice";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { MessageCircleCode } from "lucide-react";
import { FaRegEdit } from "react-icons/fa";
import Messages from "./Messages";
const ChatPage = () => {
  const { user, suggestedUsers, selectedUser } = useSelector(
    (store) => store.auth
  );
  const { onlineUsers } = useSelector((store) => store.chat);
  const isOnline = false;
  const dispatch = useDispatch();
  return (
    <div className="flex ml-[16%] h-screen">
      <section className="w-full md:w-1/4 my-4">
        <div className="flex justify-between items-center">
          <h1 className="font-bold mb-4 px-3 text-xl">{user?.username}</h1>
          <FaRegEdit className="w-8 h-8 mx-4 mb-4" />
        </div>
        <hr className="mb-4 border-gray-300" />
        <div className="overflow-y-auto h-[80vh]">
          {suggestedUsers.map((suggestedUsers) => {
            const isOnline = onlineUsers?.includes(suggestedUsers?._id);
            return (
              <div
                onClick={() => dispatch(setSelectedUser(suggestedUsers))}
                className="flex gap-3 items-center p-3 hover:bg-gray-50 cursor-pointer"
              >
                <Avatar className="w-14 h-14">
                  <AvatarImage
                    src={suggestedUsers?.profilePicture}
                  ></AvatarImage>
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className=" font-medium">
                    {suggestedUsers?.username}
                  </span>
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
        <section className="flex-1 border-l border-l-gray-300 flex flex-col h-full">
          <div className="flex gap-3 items-center px-3 py-3 border-b border-gray-300 sticky top-0 bg-white z-10">
            <Avatar>
              <AvatarImage src={selectedUser?.profilePicture} />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span>{selectedUser?.username}</span>
            </div>
          </div>
          <Messages selectedUser={selectedUser} />
          <div className="flex items-center p-4 border-t border-t-gray-500">
            <Input
              type="text"
              className="flex-1 mr-2 focus-visible:ring-transparent"
              placeholder="Message..."
            />
            <Button>Send</Button>
          </div>
        </section>
      ) : (
        <div>
          <MessageCircleCode className="w-32 h-32 my-4" />
          <h1>Your message</h1>
          <span>Send a message to start a chat</span>
        </div>
      )}
    </div>
  );
};

export default ChatPage;
