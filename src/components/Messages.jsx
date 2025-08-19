import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";

const Messages = ({ selectedUser }) => {
    
  return (
    <div className="overflow-auto flex-1 p-4">
      <div className="flex justify-center">
        <div className="flex flex-col items-center justify-center">
          <Avatar className="h-20 w-20">
            <AvatarImage src={selectedUser?.profilePicture} alt="profile" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <span>{selectedUser?.username}</span>
          <Link to={`/profile/${selectedUser?._id}`} className="h-8 my-2">
            <Button>View Profile</Button>
          </Link>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        {[1, 2, 2, 3].map((msg) => {
          return (
            <div className="flex">
              <div>{msg}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Messages;
