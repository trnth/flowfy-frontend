import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { Bookmark, MoreHorizontal } from "lucide-react";
import { Button } from "./ui/button";
import { FaRegHeart } from "react-icons/fa";
import { TbMessageCircle, TbSend } from "react-icons/tb";
import CommentDialog from "./CommentDialog";
const Post = ({ post }) => {
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const changeEvenHandler = (e) => {
    const inputText = e.target.value;
    if (inputText.trim()) {
      setText(inputText);
    } else {
      setText("");
    }
  };

  return (
    <div className="my-8 w-full max-w-sm mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar>
            <AvatarImage src={post.author.profilePicture} alt="post_image" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <h1 className="font-medium mr-2">{post.author.username}</h1>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <MoreHorizontal className="cursor-pointer" />
          </DialogTrigger>
          <DialogContent className="flex flex-col items-center text-sm text-center">
            <Button
              variant="ghost"
              className="cursor-pointer w-fit text-[#ED4956] font-bold"
            >
              Unfollow
            </Button>
            <Button variant="ghost" className="cursor-pointer w-fit font-bold">
              Add to favorites
            </Button>
            <Button
              variant="ghost"
              className="cursor-pointer w-fit text-[#ED4956] font-bold"
            >
              Delete
            </Button>
          </DialogContent>
        </Dialog>
      </div>
      <img
        className="rounded-sm my-2 w-full aspect-square object-cover"
        src={post.image}
        alt="post_image"
        srcSet=""
      />
      <div className="">
        <div className="flex items-center justify-between my-2">
          <div className="flex items-center gap-3">
            <FaRegHeart size={"22px"} />
            <TbMessageCircle
              onClick={() => setOpen(true)}
              size={"22px"}
              className="cursor-pointer hover:text-gray-600"
            />
            <TbSend
              size={"22px"}
              className="cursor-pointer hover:text-gray-600"
            />
          </div>
          <Bookmark className="cursor-pointer hover:text-gray-600" />
        </div>
        <span className="font-medium mb-2">1k likes</span>
        <p>
          <span className="font-medium mr-2">{post.author.username}</span>
          {post.caption}
        </p>
        <span
          onClick={() => setOpen(true)}
          className="cursor-pointer text-sm text-gray-400"
        >
          View all 100 comments
        </span>
        <CommentDialog open={open} setOpen={setOpen} />
        <div className="flex items-center justify-between">
          <input
            type="text"
            placeholder="Add a comment..."
            className="outline-none text-sm w-full"
            onChange={changeEvenHandler}
          />
          {text && <span className="text-[#3BADF8]">Post</span>}
        </div>
      </div>
    </div>
  );
};

export default Post;
