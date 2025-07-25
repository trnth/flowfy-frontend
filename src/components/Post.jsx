import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { Bookmark, MoreHorizontal } from "lucide-react";
import { Button } from "./ui/button";
import { FaRegHeart } from "react-icons/fa";
import { TbMessageCircle, TbSend } from "react-icons/tb";
import CommentDialog from "./CommentDialog";
const Post = () => {
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
            <AvatarImage src="" alt="post_image" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <h1>Username</h1>
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
        src="https://motgame.vn/stores/news_dataimages/2024/092024/18/12/rapper-mck-ngoai-tinh-voi-hot-girl-khuc-thi-huong-khi-van-con-quen-tlinh-20240918123317.jpg?rt=20240918170304"
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
          <span className="font-medium mr-2">username</span>
          caption
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
