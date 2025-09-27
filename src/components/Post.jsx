import React, { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { Bookmark, MoreHorizontal } from "lucide-react";
import { Button } from "./ui/button";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { TbMessageCircle, TbSend } from "react-icons/tb";
import CommentDialog from "./CommentDialog";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { setPosts, setSelectedPost, updatePost } from "@/redux/postSlice";
import { Badge } from "./ui/badge";
import { GrPrevious, GrNext } from "react-icons/gr";
import { Link } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/contexts/ToastContext";

const Post = ({ post }) => {
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const { user } = useSelector((store) => store.auth);
  const { posts } = useSelector((store) => store.post);
  const dispatch = useDispatch();
  const [liked, setLiked] = useState(post.isLiked || false);
  const [postLike, setPostLike] = useState(post.likes);
  const [commentCount, setCommentCount] = useState(post.comments || 0);
  const [bookmarked, setBookmarked] = useState(post.isBookmarked || false);
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const { success, error } = useToast();

  // Hiển thị ảnh
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Sync state when post prop changes
  useEffect(() => {
    setLiked(post.isLiked || false);
    setPostLike(post.likes);
    setCommentCount(post.comments || 0);
    setBookmarked(post.isBookmarked || false);
  }, [post]);

  // Listen for notification click events
  useEffect(() => {
    const handleOpenPostComments = (event) => {
      const { postId } = event.detail;
      if (postId === post._id) {
        dispatch(setSelectedPost(post));
        setOpen(true);
      }
    };

    window.addEventListener("openPostComments", handleOpenPostComments);
    return () => {
      window.removeEventListener("openPostComments", handleOpenPostComments);
    };
  }, [post, dispatch]);

  const changeEvenHandler = (e) => {
    const inputText = e.target.value;
    setText(inputText.trim() ? inputText : "");
  };

  const likeButtonHandler = async () => {
    try {
      // Optimistic update
      const newLiked = !liked;
      const newLikeCount = newLiked ? postLike + 1 : postLike - 1;
      setLiked(newLiked);
      setPostLike(newLikeCount);

      // Update Redux store optimistically
      dispatch(
        updatePost({
          postId: post._id,
          updates: {
            likes: newLikeCount,
            isLiked: newLiked,
          },
        })
      );

      const res = await axios.post(`/post/${post._id}/like`, {});

      if (res.data.success) {
        // Real-time update will handle the final state
        success("toast.success.postCreated");
      } else {
        // Revert on error
        setLiked(!newLiked);
        setPostLike(postLike);
        dispatch(
          updatePost({
            postId: post._id,
            updates: {
              likes: postLike,
              isLiked: !newLiked,
            },
          })
        );
      }
    } catch (error) {
      // Revert on error
      setLiked(!liked);
      setPostLike(postLike);
      dispatch(
        updatePost({
          postId: post._id,
          updates: {
            likes: postLike,
            isLiked: !liked,
          },
        })
      );
      error("toast.error.postCreate");
    }
  };

  const bookmarkHandler = async () => {
    try {
      const res = await axios.post(`/post/${post._id}/bookmark`, {});
      if (res.data.success) {
        const isSaved = res.data.type === "saved";
        setBookmarked(isSaved);

        // Update Redux state
        dispatch(
          updatePost({
            ...post,
            isBookmarked: isSaved,
          })
        );

        success(isSaved ? "Post saved" : "Post unsaved");
      }
    } catch (error) {
      console.error("Error bookmarking post:", error);
      error("Failed to update bookmark status");
    }
  };

  const commentHandler = async () => {
    try {
      const res = await axios.post(`/post/${post?._id}/comment/add`, { text });
      if (res.data.success) {
        const nextCount = (commentCount || 0) + 1;
        setCommentCount(nextCount);
        const updatePostData = posts.map((postItems) =>
          postItems._id === post._id
            ? { ...postItems, comments: nextCount }
            : postItems
        );
        dispatch(setPosts(updatePostData));
        success("toast.success.commentAdded");
        setText("");
        setOpen(true);
      }
    } catch (error) {
      error("toast.error.commentAdd");
    }
  };

  const deletePostHandler = async () => {
    try {
      const res = await axios.delete(`/post/${post?._id}/delete`);
      if (res.data.success) {
        const updatePostData = posts.filter(
          (postItems) => postItems?._id !== post?._id
        );
        dispatch(setPosts(updatePostData));
        toast.success(res.data.message);
      }
    } catch (error) {
      error("toast.error.commentAdd");
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
    <div className="my-8 w-full max-w-sm mx-auto bg-white dark:bg-slate-900">
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
              <h1 className="font-medium text-slate-900 dark:text-slate-100">
                {post.author?.username}
              </h1>
            </Link>
            {user?._id === post.author._id && (
              <Badge
                variant="secondary"
                className="bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              >
                Author
              </Badge>
            )}
          </div>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <MoreHorizontal className="cursor-pointer text-slate-900 dark:text-slate-100" />
          </DialogTrigger>
          <DialogContent className="flex flex-col items-center text-sm text-center bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
            <Button
              variant="ghost"
              className="cursor-pointer w-fit text-[#ED4956] font-bold"
            >
              Unfollow
            </Button>
            <Button
              variant="ghost"
              className="cursor-pointer w-fit font-bold text-slate-900 dark:text-slate-100"
            >
              Add to favorites
            </Button>
            {user && user?._id === post.author._id && (
              <Button
                variant="ghost"
                className="cursor-pointer w-fit text-[#ED4956] font-bold"
                onClick={deletePostHandler}
              >
                {t("common.delete")}
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
              className="cursor-pointer text-slate-900 dark:text-slate-100 hover:text-slate-600 dark:text-slate-300"
            />
            <TbSend
              size={"22px"}
              className="cursor-pointer text-slate-900 dark:text-slate-100 hover:text-slate-600 dark:text-slate-300"
            />
          </div>
          <Bookmark
            onClick={bookmarkHandler}
            className={`cursor-pointer transition-colors ${
              bookmarked
                ? "text-black dark:text-white fill-current"
                : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            }`}
          />
        </div>

        {post.likes > 0 && (
          <span className="font-medium mb-2 text-slate-900 dark:text-slate-100">
            {post.likes} likes
          </span>
        )}

        <p className="text-slate-900 dark:text-slate-100">
          <span className="font-medium mr-2">{post.author.username}</span>
          {post.caption}
        </p>

        {commentCount > 0 && (
          <span
            onClick={() => {
              dispatch(setSelectedPost(post));
              setOpen(true);
            }}
            className="cursor-pointer text-sm text-slate-500 dark:text-slate-400"
          >
            View all {commentCount} comments
          </span>
        )}

        <CommentDialog open={open} setOpen={setOpen} />

        <div className="flex items-center justify-between">
          <input
            type="text"
            placeholder="Add a comment..."
            className="outline-none text-sm w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-text-slate-500 dark:text-slate-400"
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
