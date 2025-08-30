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
import store from "@/redux/store";
import { setPosts, setSelectedPost } from "@/redux/postSlice";
import { Badge } from "./ui/badge";
const Post = ({ post }) => {
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const { user } = useSelector((store) => store.auth);
  const { posts } = useSelector((store) => store.post);
  const dispatch = useDispatch();
  const [liked, setLiked] = useState(post.isLiked || false);
  const [postLike, setPostLike] = useState(post.likes);
  const [comment, setComment] = useState(post.comments);
  const changeEvenHandler = (e) => {
    const inputText = e.target.value;
    if (inputText.trim()) {
      setText(inputText);
    } else {
      setText("");
    }
  };
  const likeButtonHandler = async () => {
    try {
      const res = await axios.post(
        `http://localhost:5000/api/v1/post/${post._id}/like`,
        {},
        { withCredentials: true }
      );

      if (res.data.success) {
        if (res.data.message === "liked") {
          setLiked(true);
        } else if (res.data.message === "unliked") {
          setLiked(false);
        }
        const updatedPost = res.data.post;
        const updatedPostsData = posts.map((postItem) =>
          postItem._id === post._id
            ? {
                ...postItem,
                likes: updatedPost.likes,
                comments: updatedPost.comments,
                isLiked: liked,
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
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      if (res.data.success) {
        const updateCommentData = [res.data.comment, ...comment];
        setComment(updateCommentData);
        const updatePostData = posts.map((postItems) =>
          postItems._id == post._id
            ? {
                ...postItems,
                comments: updateCommentData,
              }
            : postItems
        );
        dispatch(setPosts(updatePostData));
        toast.success(res.data.message);
        setText("");
      }
    } catch (error) {
      toast.error(error.response.data.message);
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
      console.log(error);
      toast.error(error.response.data.message);
    }
  };
  return (
    <div className="my-8 w-full max-w-sm mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar>
            <AvatarImage src={post.author.profilePicture} alt="post_image" />
            <AvatarFallback> CN</AvatarFallback>
          </Avatar>
          <div className="flex items-center gap-3">
            <h1 className="font-medium">{post.author?.username}</h1>
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
            {user && user?._id == post.author._id && (
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
      <img
        className="rounded-sm my-2 w-full aspect-square object-cover"
        src={post.image}
        alt="post_image"
        srcSet=""
      />
      <div className="">
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
        <span
          onClick={() => {
            dispatch(setSelectedPost(post));
            setOpen(true);
          }}
          className="cursor-pointer text-sm text-gray-400"
        >
          View all {posts.comments} comments
        </span>
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
              className="text-[#3BADF8] cursor-pointer "
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
