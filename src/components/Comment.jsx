import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Heart } from "lucide-react";

const Comment = ({ comment }) => {
  return (
    <div className="flex gap-2">
      <Avatar className="w-6 h-6">
        <AvatarImage src={comment.author.profilePicture} />
        <AvatarFallback>{comment.author.username[0]}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <span className="font-semibold text-sm">{comment.author.username}</span>{" "}
        <span>{comment.text}</span>
        <div className="flex gap-4 text-xs text-gray-500 mt-1">
          <span>{comment.createdAt}</span>
          <button className="hover:text-gray-700">Like</button>
          <button className="hover:text-gray-700">Reply</button>
        </div>
      </div>
      <Heart className="w-4 h-4 cursor-pointer text-gray-500 hover:text-red-500" />
    </div>
  );
};

export default Comment;
