import React from "react";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Link } from "react-router-dom";
import { MoreHorizontal } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";
const CommentDialog = ({ open, setOpen }) => {
  const [text, setText] = useState("");
  const changeEvenHandler = (e) => {
    const inputText = e.target.value;
    if (inputText.trim()) {
      setText(inputText);
    } else {
      setText("");
    }
  };
  const sendMessageHandler = () => {
    alert(text);
  };
  return (
    <Dialog open={open}>
      <DialogContent
        className="max-w-5xl w-full p-0 flex flex-col"
        onInteractOutside={() => setOpen(false)}
      >
        <div className="flex flex-1">
          <div className="w-1/2">
            <img
              src="https://motgame.vn/stores/news_dataimages/2024/092024/18/12/rapper-mck-ngoai-tinh-voi-hot-girl-khuc-thi-huong-khi-van-con-quen-tlinh-20240918123317.jpg?rt=20240918170304"
              alt="post_image"
              srcset=""
              className=" w-full h-full object-cover rounded-l-lg"
            />
          </div>
          <div className="w-1/2 flex-col flex justify-between">
            <div className="flex items-center justify-between">
              <div className="flex gap-3 items-center">
                <Link>
                  <Avatar>
                    <AvatarImage src="" alt="post_image" />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                </Link>
                <div>
                  <Link className="font-semibold text-xs">username</Link>
                </div>
              </div>

              <Dialog>
                <DialogTrigger asChild>
                  <MoreHorizontal className="cursor-pointer " />
                </DialogTrigger>
                <DialogContent className="flex flex-col items-center text-sm text-center">
                  <div className="cursor-pointer w-fit text-[#ED4956] font-bold">
                    Unfollow
                  </div>
                  <div className="cursor-pointer w-fit  font-bold">
                    Add to favorites
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <hr />
            <div className="flex-1 overflow-y-auto max-h-96 p-4">comments</div>
            <div className="p-4">
              <div className=" flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Add a comment..."
                  className="w-full outline-none "
                  onChange={changeEvenHandler}
                />
                <Button disabled={!text.trim()} onClick={sendMessageHandler}>
                  Send
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CommentDialog;
