import React, { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Link } from "react-router-dom";
import { MoreHorizontal, Heart, X } from "lucide-react";
import { Button } from "./ui/button";
import { useSelector } from "react-redux";
import Comment from "./Comment";
const CommentDialog = ({ open, setOpen }) => {
  const [text, setText] = useState("");
  const { selectedPost } = useSelector((store) => store.post);

  const changeEventHandler = (e) => {
    const inputText = e.target.value;
    setText(inputText.trim() ? inputText : "");
  };

  const sendMessageHandler = () => {
    // TODO: Thay bằng API call để gửi comment
    alert(text);
    setText("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="w-[90vw] max-w-[900px] min-w-[500px] h-[80vh] p-0 flex rounded-lg overflow-hidden sm:max-w-[900px] border-0"
        style={{ maxWidth: "900px !important" }}
      >
        <div className="flex w-full h-full">
          {/* Bên trái - ảnh bài post */}
          <div className="flex-[0.6] h-full bg-black">
            {selectedPost?.image ? (
              <img
                src={selectedPost.image}
                alt="post_img"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                No image available
              </div>
            )}
          </div>

          {/* Bên phải - phần comment */}
          <div className="flex-[0.4] h-full flex flex-col bg-white">
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b">
              <div className="flex gap-2 items-center">
                <Link to={`/${selectedPost?.author?.username || ""}`}>
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={selectedPost?.author?.profilePicture} />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                </Link>
                <Link
                  to={`/${selectedPost?.author?.username || ""}`}
                  className="font-semibold text-sm hover:underline"
                >
                  {selectedPost?.author?.username || "Unknown"}
                </Link>
              </div>
              <div className="flex items-center gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <MoreHorizontal className="cursor-pointer w-5 h-5" />
                  </DialogTrigger>
                  <DialogContent className="flex flex-col items-center text-sm p-4 rounded-t-lg sm:max-w-[400px] border-0">
                    <div className="cursor-pointer w-full text-[#ED4956] font-bold py-2">
                      Unfollow
                    </div>
                    <div className="cursor-pointer w-full py-2">
                      Add to favorites
                    </div>
                  </DialogContent>
                </Dialog>
                <X
                  className="cursor-pointer w-5 h-5"
                  onClick={() => setOpen(false)}
                />
              </div>
            </div>
            <hr />
            {/* Comment list */}
            <div className="flex-1 overflow-y-auto p-4 min-h-0">
              {selectedPost?.comments?.length > 0 ? (
                selectedPost.comments.map((comment) => (
                  <Comment key={comment._id} comment={comment} />
                ))
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  Chưa có bình luận
                </div>
              )}
            </div>
            {/* Input - cố định ở dưới đáy */}
            <div className="p-3 border-t">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={text}
                  onChange={changeEventHandler}
                  placeholder="Thêm bình luận..."
                  className="w-full outline-none text-sm border-b border-gray-300 py-1 bg-transparent"
                />
                <Button
                  disabled={!text.trim()}
                  onClick={sendMessageHandler}
                  className={`text-sm ${
                    text.trim() ? "text-[#0095F6]" : "text-gray-400"
                  } bg-transparent hover:bg-transparent`}
                >
                  Đăng
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
