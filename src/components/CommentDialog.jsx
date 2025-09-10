import React, { useEffect, useState } from "react";
import { Dialog, DialogContent } from "./ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Link } from "react-router-dom";
import { MoreHorizontal, X } from "lucide-react";
import { Button } from "./ui/button";
import { useDispatch, useSelector } from "react-redux";
import Comment from "./Comment";
import { toast } from "sonner";
import { setPosts, setSelectedPost } from "@/redux/postSlice";
import axios from "axios";
import { GrPrevious, GrNext } from "react-icons/gr";

const CommentDialog = ({ open, setOpen }) => {
  const [text, setText] = useState("");
  const { selectedPost, posts } = useSelector((store) => store.post);
  const [comment, setComment] = useState([]);
  const dispatch = useDispatch();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    if (selectedPost) {
      setComment(selectedPost.comments);
      setCurrentImageIndex(0);
    }
  }, [selectedPost]);

  const changeEventHandler = (e) => {
    const inputText = e.target.value;
    setText(inputText.trim() ? inputText : "");
  };

  const sendMessageHandler = async () => {
    try {
      const res = await axios.post(
        `http://localhost:5000/api/v1/post/${selectedPost._id}/comment`,
        { text },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      if (res.data.success) {
        const updateCommentData = [res.data.comment, ...comment];
        setComment(updateCommentData);
        const updatePostData = posts.map((postItems) =>
          postItems._id === selectedPost._id
            ? { ...postItems, comments: updateCommentData }
            : postItems
        );
        dispatch(setPosts(updatePostData));
        dispatch(
          setSelectedPost({ ...selectedPost, comments: updateCommentData })
        );
        toast.success(res.data.message);
        setText("");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to post comment");
    }
  };

  const switchImage = (newIndex) => {
    setFade(true);
    setTimeout(() => {
      setCurrentImageIndex(newIndex);
      setFade(false);
    }, 200);
  };

  const handlePrevImage = () => {
    if (!selectedPost?.images) return;
    const newIndex =
      currentImageIndex === 0
        ? selectedPost.images.length - 1
        : currentImageIndex - 1;
    switchImage(newIndex);
  };

  const handleNextImage = () => {
    if (!selectedPost?.images) return;
    const newIndex =
      currentImageIndex === selectedPost.images.length - 1
        ? 0
        : currentImageIndex + 1;
    switchImage(newIndex);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="w-[90vw] max-w-[900px] min-w-[500px] h-[80vh] p-0 flex rounded-lg overflow-hidden sm:max-w-[900px] border-none">
        <div className="flex w-full h-full">
          {/* Left side - Post images */}
          <div className="flex-[0.6] h-full bg-black relative flex items-center justify-center overflow-hidden">
            {selectedPost?.images?.length > 0 ? (
              <>
                {/* Background blur */}
                <img
                  src={selectedPost.images[currentImageIndex]}
                  alt="background blur"
                  className="absolute inset-0 w-full h-full object-cover blur-xl scale-110 opacity-40"
                />

                {/* Main image */}
                <div className="relative z-10 flex items-center justify-center w-full h-full">
                  <img
                    src={selectedPost.images[currentImageIndex]}
                    alt={`post image ${currentImageIndex}`}
                    className={`max-w-full max-h-full object-contain transition-opacity duration-500 ease-in-out ${
                      fade ? "opacity-0" : "opacity-100"
                    }`}
                  />
                </div>

                {/* Previous button */}
                {selectedPost.images.length > 1 && (
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-2 z-20 bg-black/40 p-2 rounded-full hover:bg-black/70 transition-all duration-200"
                    aria-label="Previous image"
                  >
                    <GrPrevious className="text-white text-2xl" />
                  </button>
                )}

                {/* Next button */}
                {selectedPost.images.length > 1 && (
                  <button
                    onClick={handleNextImage}
                    className="absolute right-2 z-20 bg-black/40 p-2 rounded-full hover:bg-black/70 transition-all duration-200"
                    aria-label="Next image"
                  >
                    <GrNext className="text-white text-2xl" />
                  </button>
                )}

                {/* Dot indicators */}
                {selectedPost.images.length > 1 && (
                  <div className="absolute bottom 四 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                    {selectedPost.images.map((_, idx) => (
                      <span
                        key={idx}
                        className={`w-2 h-2 rounded-full transition-all duration-200 ${
                          idx === currentImageIndex ? "bg-white" : "bg-white/40"
                        }`}
                      ></span>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                No image available
              </div>
            )}
          </div>
          {/* Right side - Comments section */}
          <div className="flex-[0.4] h-full flex flex-col bg-white">
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b">
              <div className="flex gap-2 items-center">
                <Link to={`/${selectedPost?.author?.username || ""}`}>
                  <Avatar className="w-8 h-8">
                    <AvatarImage
                      src={selectedPost?.author?.profilePicture}
                      alt="User avatar"
                    />
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
                <MoreHorizontal className="cursor-pointer w-5 h-5 hover:text-gray-600" />
                <X
                  className="cursor-pointer w-5 h-5 hover:text-gray-600"
                  onClick={() => setOpen(false)}
                  aria-label="Close dialog"
                />
              </div>
            </div>

            {/* Comment list */}
            <div className="flex-1 overflow-y-auto p-4 min-h-0">
              {comment?.length > 0 ? (
                comment.map((cmt) => <Comment key={cmt._id} comment={cmt} />)
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No comments yet
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-3 border-t">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={text}
                  onChange={changeEventHandler}
                  placeholder="Add a comment..."
                  className="w-full outline-none text-sm border-b border-gray-300 py-1 bg-transparent focus:border-blue-500 transition-colors"
                  aria-label="Comment input"
                />
                <Button
                  disabled={!text.trim()}
                  onClick={sendMessageHandler}
                  className={`text-sm font-medium ${
                    text.trim()
                      ? "text-blue-500 hover:text-blue-600"
                      : "text-gray-400 cursor-not-allowed"
                  } bg-transparent hover:bg-transparent`}
                >
                  Post
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
