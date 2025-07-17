import React from "react";
import { Dialog, DialogContent } from "./ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
const CommentDialog = ({ open, setOpen }) => {
  return (
    <Dialog open={open}>
      <DialogContent
        className="max-w-5xl w-full p-0 flex h-[80vh] overflow-hidden"
        onInteractOutside={() => setOpen(false)}
      >
        <div className="flex flex-1">
          <div className="w-2/3">
            <img
              src="https://motgame.vn/stores/news_dataimages/2024/092024/18/12/rapper-mck-ngoai-tinh-voi-hot-girl-khuc-thi-huong-khi-van-con-quen-tlinh-20240918123317.jpg?rt=20240918170304"
              alt="post_image"
              srcset=""
              className=" object-cover rounded-l-lg w-full h-full"
            />
          </div>
          <div className="w-1/3 flex-col flex justify-between">
            <div className="flex items-center justify-between">
              <Avatar>
                <AvatarImage src="" alt="post_image" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CommentDialog;
