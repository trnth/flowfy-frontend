import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { Bookmark, MoreHorizontal } from "lucide-react";
import { Button } from "./ui/button";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { TbMessageCircle, TbSend } from "react-icons/tb";
import CommentDialog from "./CommentDialog";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import axios from "axios";
import { setPosts, setSelectedPost } from "@/redux/postSlice";
import { Badge } from "./ui/badge";
import { GrPrevious, GrNext } from "react-icons/gr";
import { Link } from "react-router-dom";

const Post = ({ post }) => {
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const { user } = useSelector((store) => store.auth);
  const { posts } = useSelector((store) => store.post);
  const dispatch = useDispatch();
  const [liked, setLiked] = useState(post.isLiked || false);
  const [postLike, setPostLike] = useState(post.likes);
  const [comment, setComment] = useState(post.comments);

  // Hiển thị ảnh
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const changeEvenHandler = (e) => {
    const inputText = e.target.value;
    setText(inputText.trim() ? inputText : "");
  };

  const likeButtonHandler = async () => {
    try {
      const res = await axios.post(
        `http://localhost:5000/api/v1/post/${post._id}/like`,
        {},
        { withCredentials: true }
      );

      if (res.data.success) {
        setLiked(res.data.message === "liked");
        const updatedPost = res.data.post;
        const updatedPostsData = posts.map((postItem) =>
          postItem._id === post._id
            ? {
                ...postItem,
                likes: updatedPost.likes,
                comments: updatedPost.comments,
                isLiked: res.data.message === "liked",
              }
            : postItem
        );
        dispatch(setPosts(updatedPostsData));
        toast.success(res.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  const commentHandler = async () => {
    try {
      const res = await axios.post(
        `http://localhost:5000/api/v1/post/${post?._id}/comment`,
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
          postItems._id === post._id
            ? { ...postItems, comments: updateCommentData }
            : postItems
        );
        dispatch(setPosts(updatePostData));
        toast.success(res.data.message);
        setText("");
      }
    } catch (error) {
      toast.error(error.response?.data?.message);
    }
  };

  const deletePostHandler = async () => {
    try {
      const res = await axios.delete(
        `http://localhost:5000/api/v1/post/delete/${post?._id}`,
        { withCredentials: true }
      );
      if (res.data.success) {
        const updatePostData = posts.filter(
          (postItems) => postItems?._id !== post?._id
        );
        dispatch(setPosts(updatePostData));
        toast.success(res.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message);
    }
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? post.images.length - 1 : prev - 1
    );
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === post.images.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <div className="my-8 w-full max-w-sm mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to={`/profile/${post.author?.username}`}>
            <Avatar className="w-12 h-12">
              <AvatarImage src={post.author.profilePicture} alt="post_image" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex items-center gap-3">
            <Link to={`/profile/${post.author?.username}`}>
              <h1 className="font-medium">{post.author?.username}</h1>
            </Link>
            {user?._id === post.author._id && (
              <Badge variant="secondary">Author</Badge>
            )}
          </div>
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
            {user && user?._id === post.author._id && (
              <Button
                variant="ghost"
                className="cursor-pointer w-fit text-[#ED4956] font-bold"
                onClick={deletePostHandler}
              >
                Delete
              </Button>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Image Carousel */}
      <div className="relative w-full aspect-square my-2">
        <img
          className="rounded-sm w-full h-full object-cover"
          src={post.images[currentImageIndex]}
          alt={`post_image_${currentImageIndex}`}
        />
        {post.images.length > 1 && (
          <>
            <GrPrevious
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 cursor-pointer text-white text-2xl"
            />
            <GrNext
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer text-white text-2xl"
            />
            {/* Dots */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {post.images.map((_, idx) => (
                <span
                  key={idx}
                  className={`w-2 h-2 rounded-full ${
                    idx === currentImageIndex ? "bg-white" : "bg-white/50"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Post Actions */}
      <div>
        <div className="flex items-center justify-between my-2">
          <div className="flex items-center gap-3">
            {liked ? (
              <FaHeart
                onClick={likeButtonHandler}
                className="fill-[#ff3040]"
                size={"22px"}
              />
            ) : (
              <FaRegHeart onClick={likeButtonHandler} size={"22px"} />
            )}
            <TbMessageCircle
              onClick={() => {
                dispatch(setSelectedPost(post));
                setOpen(true);
              }}
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

        {post.likes > 0 && (
          <span className="font-medium mb-2">{post.likes} likes</span>
        )}

        <p>
          <span className="font-medium mr-2">{post.author.username}</span>
          {post.caption}
        </p>

        {post.comments > 0 && (
          <span
            onClick={() => {
              dispatch(setSelectedPost(post));
              setOpen(true);
            }}
            className="cursor-pointer text-sm text-gray-400"
          >
            View all {comment.length} comments
          </span>
        )}

        <CommentDialog open={open} setOpen={setOpen} />

        <div className="flex items-center justify-between">
          <input
            type="text"
            placeholder="Add a comment..."
            className="outline-none text-sm w-full"
            onChange={changeEvenHandler}
            value={text}
          />
          {text && (
            <span
              className="text-[#3BADF8] cursor-pointer"
              onClick={commentHandler}
            >
              Post
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Post;
