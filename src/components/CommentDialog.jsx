import React, { useEffect, useState } from "react";
import { Dialog, DialogContent } from "./ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Link } from "react-router-dom";
import { MoreHorizontal, X, Heart, Bookmark } from "lucide-react";
import { Button } from "./ui/button";
import { useDispatch, useSelector } from "react-redux";
import Comment from "./Comment";
import { setPosts, setSelectedPost, addCommentToPost } from "@/redux/postSlice";
import axios from "axios";
import { GrPrevious, GrNext } from "react-icons/gr";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/contexts/ToastContext";

const CommentDialog = ({ open, setOpen }) => {
  const [text, setText] = useState("");
  const { selectedPost, posts } = useSelector((store) => store.post);
  const [comment, setComment] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const { success, error } = useToast();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [fade, setFade] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [expandedReplies, setExpandedReplies] = useState(new Set());
  const [repliesPagination, setRepliesPagination] = useState({});
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  useEffect(() => {
    if (selectedPost) {
      const comments = Array.isArray(selectedPost.comments)
        ? selectedPost.comments
        : [];
      setComment(comments);
      setCurrentImageIndex(0);

      // Sync like and bookmark states
      setIsLiked(selectedPost.isLiked || false);
      setIsBookmarked(selectedPost.isBookmarked || false);
      setLikesCount(selectedPost.likes || 0);

      // Nếu selectedPost.comments không phải là danh sách mà chỉ là số lượng,
      // ta sẽ fetch danh sách bình luận từ backend
      if (!Array.isArray(selectedPost.comments)) {
        fetchComments(true);
      }
    }
  }, [selectedPost]);

  // Listen for real-time comment updates
  useEffect(() => {
    const handleCommentAdded = (event) => {
      const { postId, comment: newComment } = event.detail;
      if (postId === selectedPost?._id) {
        if (newComment.parentComment) {
          // This is a reply, add it to the parent comment's replies
          setComment((prevComments) => {
            if (!Array.isArray(prevComments)) {
              console.error(
                "prevComments is not an array in real-time update:",
                prevComments
              );
              return prevComments;
            }
            return prevComments.map((comment) => {
              // Check if this is a direct reply to a top-level comment
              if (comment._id === newComment.parentComment) {
                return {
                  ...comment,
                  replies: [...(comment.replies || []), newComment],
                  repliesCount: (comment.repliesCount || 0) + 1,
                };
              }

              // Check if this is a reply to a level 1 comment (nested reply)
              if (comment.replies) {
                const updatedReplies = comment.replies.map((reply) =>
                  reply._id === newComment.parentComment
                    ? {
                        ...reply,
                        replies: [...(reply.replies || []), newComment],
                        repliesCount: (reply.repliesCount || 0) + 1,
                      }
                    : reply
                );
                return { ...comment, replies: updatedReplies };
              }

              return comment;
            });
          });
        } else {
          // This is a top-level comment, add it to the beginning
          setComment((prevComments) => {
            if (!Array.isArray(prevComments)) {
              console.error(
                "prevComments is not an array in real-time update:",
                prevComments
              );
              return [newComment];
            }
            return [newComment, ...prevComments];
          });
        }
      }
    };

    window.addEventListener("commentAdded", handleCommentAdded);
    return () => {
      window.removeEventListener("commentAdded", handleCommentAdded);
    };
  }, [selectedPost]);

  const fetchComments = async (reset = false) => {
    if (!selectedPost?._id || loading) return;
    try {
      setLoading(true);
      const res = await axios.post(
        `/post/${selectedPost._id}/comment/all`,
        {},
        {
          params: { page: reset ? 1 : page, limit },
        }
      );
      if (res.data?.success) {
        const list = res.data.comments || [];
        // Ensure each comment has repliesCount
        const commentsWithRepliesCount = list.map((comment) => ({
          ...comment,
          repliesCount: comment.repliesCount || 0,
        }));
        setComment((prev) =>
          reset
            ? commentsWithRepliesCount
            : [...prev, ...commentsWithRepliesCount]
        );
        const currentPage = Number(res.data.currentPage || 1);
        const totalPages = Number(res.data.totalPages || 1);
        setHasMore(currentPage < totalPages);
        setPage(currentPage + 1);
      }
    } catch (err) {
      console.error("Failed to fetch comments:", err);
    } finally {
      setLoading(false);
    }
  };

  const changeEventHandler = (e) => {
    const inputText = e.target.value;
    setText(inputText.trim() ? inputText : "");
  };

  const sendMessageHandler = async () => {
    try {
      // Optimistic update
      const tempComment = {
        _id: `temp-${Date.now()}`,
        text,
        author: { username: "You", profilePicture: "" },
        createdAt: new Date().toISOString(),
        isOptimistic: true,
        parentComment: replyingTo?._id || null,
      };

      if (replyingTo) {
        // This is a reply, add it to the parent comment's replies
        setComment((prevComments) => {
          if (!Array.isArray(prevComments)) {
            console.error(
              "prevComments is not an array in optimistic update:",
              prevComments
            );
            return prevComments;
          }
          return prevComments.map((comment) => {
            // Check if this is a direct reply to a top-level comment
            if (comment._id === replyingTo._id) {
              return {
                ...comment,
                replies: [...(comment.replies || []), tempComment],
                repliesCount: (comment.repliesCount || 0) + 1,
              };
            }

            // Check if this is a reply to a level 1 comment (nested reply)
            if (comment.replies) {
              const updatedReplies = comment.replies.map((reply) =>
                reply._id === replyingTo._id
                  ? {
                      ...reply,
                      replies: [...(reply.replies || []), tempComment],
                      repliesCount: (reply.repliesCount || 0) + 1,
                    }
                  : reply
              );
              return { ...comment, replies: updatedReplies };
            }

            return comment;
          });
        });
      } else {
        // This is a top-level comment
        setComment((prevComments) => {
          if (!Array.isArray(prevComments)) {
            console.error(
              "prevComments is not an array in optimistic update:",
              prevComments
            );
            return [tempComment];
          }
          return [tempComment, ...prevComments];
        });
      }

      // Update Redux store optimistically
      dispatch(
        addCommentToPost({
          postId: selectedPost._id,
          comment: tempComment,
        })
      );

      const res = await axios.post(`/post/${selectedPost._id}/comment/add`, {
        text,
        parentCommentId: replyingTo?._id || null,
      });

      if (res.data.success) {
        // Replace temp comment with real comment
        if (replyingTo) {
          // This is a reply, update the parent comment's replies
          setComment((prevComments) => {
            if (!Array.isArray(prevComments)) {
              console.error("prevComments is not an array:", prevComments);
              return prevComments;
            }
            return prevComments.map((comment) => {
              // Check if this is a direct reply to a top-level comment
              if (comment._id === replyingTo._id) {
                return {
                  ...comment,
                  replies: comment.replies?.map((reply) =>
                    reply.isOptimistic ? res.data.comment : reply
                  ) || [res.data.comment],
                };
              }

              // Check if this is a reply to a level 1 comment (nested reply)
              if (comment.replies) {
                const updatedReplies = comment.replies.map((reply) =>
                  reply._id === replyingTo._id
                    ? {
                        ...reply,
                        replies: reply.replies?.map((nestedReply) =>
                          nestedReply.isOptimistic
                            ? res.data.comment
                            : nestedReply
                        ) || [res.data.comment],
                      }
                    : reply
                );
                return { ...comment, replies: updatedReplies };
              }

              return comment;
            });
          });
        } else {
          // This is a top-level comment
          const currentComments = Array.isArray(comment) ? comment : [];
          const finalCommentData = [
            res.data.comment,
            ...currentComments.filter((c) => !c.isOptimistic),
          ];
          setComment(finalCommentData);
        }

        dispatch(setSelectedPost({ ...selectedPost, comments: comment }));
        toast.success(res.data.message);
        setText("");
        setReplyingTo(null);
      } else {
        // Revert on error
        const currentComments = Array.isArray(comment) ? comment : [];
        setComment(currentComments);
        toast.error("Failed to post comment");
      }
    } catch (error) {
      // Revert on error
      const currentComments = Array.isArray(comment) ? comment : [];
      setComment(currentComments);
      console.error(error);
      error("toast.error.commentAdd");
    }
  };

  const handleReply = (commentToReply) => {
    setReplyingTo(commentToReply);
    setText(`@${commentToReply.author.username} `);
  };

  const handleShowReplies = async (comment) => {
    if (expandedReplies.has(comment._id)) {
      // Already expanded, collapse it
      setExpandedReplies((prev) => {
        const newSet = new Set(prev);
        newSet.delete(comment._id);
        return newSet;
      });

      // Mark as not expanded
      setComment((prevComments) =>
        prevComments.map((cmt) => {
          if (cmt._id === comment._id) {
            return { ...cmt, isExpanded: false };
          }

          if (cmt.replies) {
            const updatedReplies = cmt.replies.map((reply) =>
              reply._id === comment._id
                ? { ...reply, isExpanded: false }
                : reply
            );
            return { ...cmt, replies: updatedReplies };
          }

          return cmt;
        })
      );
    } else {
      // Expand and fetch replies
      setExpandedReplies((prev) => new Set([...prev, comment._id]));

      // Fetch replies if not already loaded
      if (!comment.replies || comment.replies.length === 0) {
        try {
          const res = await axios.get(`/post/comment/${comment._id}/reply`, {
            params: { page: 1, limit: 5 },
          });

          if (res.data.success) {
            // Update the comment with replies
            const repliesWithCount = res.data.replies.map((reply) => ({
              ...reply,
              repliesCount: reply.repliesCount || 0,
              isExpanded: false,
            }));

            // Update pagination info
            setRepliesPagination((prev) => ({
              ...prev,
              [comment._id]: {
                currentPage: 1,
                totalPages: res.data.totalPages,
                hasMore: res.data.hasMore,
              },
            }));

            setComment((prevComments) =>
              prevComments.map((cmt) => {
                if (cmt._id === comment._id) {
                  return {
                    ...cmt,
                    replies: repliesWithCount,
                    repliesCount: res.data.total,
                    isExpanded: true,
                  };
                }

                // Also update nested replies if this is a nested comment
                if (cmt.replies) {
                  const updatedReplies = cmt.replies.map((reply) =>
                    reply._id === comment._id
                      ? {
                          ...reply,
                          replies: repliesWithCount,
                          repliesCount: res.data.total,
                          isExpanded: true,
                        }
                      : reply
                  );
                  return { ...cmt, replies: updatedReplies };
                }

                return cmt;
              })
            );
          }
        } catch (error) {
          console.error("Failed to fetch replies:", error);
          toast.error("Không thể tải replies");
        }
      } else {
        // Just mark as expanded
        setComment((prevComments) =>
          prevComments.map((cmt) => {
            if (cmt._id === comment._id) {
              return { ...cmt, isExpanded: true };
            }

            if (cmt.replies) {
              const updatedReplies = cmt.replies.map((reply) =>
                reply._id === comment._id
                  ? { ...reply, isExpanded: true }
                  : reply
              );
              return { ...cmt, replies: updatedReplies };
            }

            return cmt;
          })
        );
      }
    }
  };

  const handleLoadMoreReplies = async (comment) => {
    const pagination = repliesPagination[comment._id];
    if (!pagination || !pagination.hasMore) return;

    try {
      const nextPage = pagination.currentPage + 1;
      const res = await axios.get(`/post/comment/${comment._id}/reply`, {
        params: { page: nextPage, limit: 5 },
      });

      if (res.data.success) {
        const newReplies = res.data.replies.map((reply) => ({
          ...reply,
          repliesCount: reply.repliesCount || 0,
          isExpanded: false,
        }));

        // Update pagination info
        setRepliesPagination((prev) => ({
          ...prev,
          [comment._id]: {
            currentPage: nextPage,
            totalPages: res.data.totalPages,
            hasMore: res.data.hasMore,
          },
        }));

        // Add new replies to existing ones
        setComment((prevComments) =>
          prevComments.map((cmt) => {
            if (cmt._id === comment._id) {
              return {
                ...cmt,
                replies: [...(cmt.replies || []), ...newReplies],
              };
            }

            if (cmt.replies) {
              const updatedReplies = cmt.replies.map((reply) =>
                reply._id === comment._id
                  ? {
                      ...reply,
                      replies: [...(reply.replies || []), ...newReplies],
                    }
                  : reply
              );
              return { ...cmt, replies: updatedReplies };
            }

            return cmt;
          })
        );
      }
    } catch (error) {
      console.error("Failed to load more replies:", error);
      toast.error("Không thể tải thêm replies");
    }
  };

  const cancelReply = () => {
    setReplyingTo(null);
    setText("");
  };

  const switchImage = (newIndex) => {
    setFade(true);
    setIsZoomed(false);
    setZoomLevel(1);
    setImagePosition({ x: 0, y: 0 });
    setTimeout(() => {
      setCurrentImageIndex(newIndex);
      setFade(false);
    }, 200);
  };

  const handleImageClick = () => {
    if (isZoomed) {
      setIsZoomed(false);
      setZoomLevel(1);
      setImagePosition({ x: 0, y: 0 });
    } else {
      setIsZoomed(true);
      setZoomLevel(2);
    }
  };

  const handleImageDoubleClick = () => {
    // Double click to like (Instagram behavior)
    handleLike();
  };

  const handleLike = async () => {
    if (!selectedPost) return;

    try {
      const res = await axios.post(
        `http://localhost:5000/api/v1/post/${selectedPost._id}/like`,
        {},
        { withCredentials: true }
      );

      if (res.data.success) {
        setIsLiked(!isLiked);
        setLikesCount((prev) => (isLiked ? prev - 1 : prev + 1));

        // Update selectedPost in Redux
        dispatch(
          setSelectedPost({
            ...selectedPost,
            isLiked: !isLiked,
            likes: isLiked ? selectedPost.likes - 1 : selectedPost.likes + 1,
          })
        );
      }
    } catch (error) {
      console.error("Error liking post:", error);
      error("Failed to update like status");
    }
  };

  const handleBookmark = async () => {
    if (!selectedPost) return;

    try {
      const res = await axios.post(
        `http://localhost:5000/api/v1/post/${selectedPost._id}/bookmark`,
        {},
        { withCredentials: true }
      );

      if (res.data.success) {
        setIsBookmarked(!isBookmarked);

        // Update selectedPost in Redux
        dispatch(
          setSelectedPost({
            ...selectedPost,
            isBookmarked: !isBookmarked,
          })
        );

        success(isBookmarked ? "Post unsaved" : "Post saved");
      }
    } catch (error) {
      console.error("Error bookmarking post:", error);
      error("Failed to update bookmark status");
    }
  };

  const handleWheel = (e) => {
    if (isZoomed) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      const newZoom = Math.max(1, Math.min(3, zoomLevel + delta));
      setZoomLevel(newZoom);
    }
  };

  const handleMouseMove = (e) => {
    if (isZoomed && e.buttons === 1) {
      setImagePosition((prev) => ({
        x: prev.x + e.movementX,
        y: prev.y + e.movementY,
      }));
    }
  };

  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && selectedPost?.images?.length > 1) {
      handleNextImage();
    }
    if (isRightSwipe && selectedPost?.images?.length > 1) {
      handlePrevImage();
    }
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
      <DialogContent className="w-[90vw] max-w-[900px] min-w-[500px] h-[80vh] p-0 flex rounded-lg overflow-hidden sm:max-w-[900px] border-none bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
        <div className="flex w-full h-full">
          {/* Left side - Post images */}
          <div className="flex-[0.6] h-full bg-black relative flex items-center justify-center overflow-hidden select-none">
            {selectedPost?.images?.length > 0 ? (
              <>
                {/* Main image container */}
                <div
                  className="relative w-full h-full flex items-center justify-center cursor-zoom-in"
                  onClick={handleImageClick}
                  onDoubleClick={handleImageDoubleClick}
                  onWheel={handleWheel}
                  onMouseMove={handleMouseMove}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                >
                  <img
                    src={selectedPost.images[currentImageIndex]}
                    alt={`post image ${currentImageIndex}`}
                    className={`max-w-full max-h-full object-contain transition-all duration-300 ease-out ${
                      fade ? "opacity-0 scale-95" : "opacity-100 scale-100"
                    } ${isZoomed ? "cursor-zoom-out" : "cursor-zoom-in"}`}
                    style={{
                      transform: `scale(${zoomLevel}) translate(${imagePosition.x}px, ${imagePosition.y}px)`,
                      transformOrigin: "center center",
                    }}
                    draggable={false}
                  />
                </div>

                {/* Navigation buttons */}
                {selectedPost.images.length > 1 && (
                  <>
                    {/* Previous button */}
                    <button
                      onClick={handlePrevImage}
                      className="absolute left-3 z-20 bg-black/20 backdrop-blur-sm p-2 rounded-full hover:bg-black/40 transition-all duration-200 group"
                      aria-label="Previous image"
                    >
                      <GrPrevious className="text-white text-xl group-hover:scale-110 transition-transform" />
                    </button>

                    {/* Next button */}
                    <button
                      onClick={handleNextImage}
                      className="absolute right-3 z-20 bg-black/20 backdrop-blur-sm p-2 rounded-full hover:bg-black/40 transition-all duration-200 group"
                      aria-label="Next image"
                    >
                      <GrNext className="text-white text-xl group-hover:scale-110 transition-transform" />
                    </button>
                  </>
                )}

                {/* Dot indicators */}
                {selectedPost.images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                    {selectedPost.images.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => switchImage(idx)}
                        className={`w-2 h-2 rounded-full transition-all duration-200 hover:scale-125 ${
                          idx === currentImageIndex
                            ? "bg-white scale-125"
                            : "bg-white/50 hover:bg-white/70"
                        }`}
                        aria-label={`Go to image ${idx + 1}`}
                      />
                    ))}
                  </div>
                )}

                {/* Zoom indicator */}
                {isZoomed && (
                  <div className="absolute top-4 right-4 z-20 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                    {Math.round(zoomLevel * 100)}%
                  </div>
                )}

                {/* Image counter */}
                {selectedPost.images.length > 1 && (
                  <div className="absolute top-4 left-4 z-20 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                    {currentImageIndex + 1} / {selectedPost.images.length}
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-900">
                <div className="text-center">
                  <div className="text-4xl mb-2">📷</div>
                  <div className="text-sm">No image available</div>
                </div>
              </div>
            )}
          </div>
          {/* Right side - Comments section */}
          <div className="flex-[0.4] h-full flex flex-col bg-white dark:bg-slate-900">
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-slate-200 dark:border-slate-700">
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
                  className={`font-semibold text-sm hover:underline ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  {selectedPost?.author?.username || "Unknown"}
                </Link>
              </div>
              <div className="flex items-center gap-2">
                <MoreHorizontal
                  className={`cursor-pointer w-5 h-5 ${
                    isDark ? "hover:text-gray-300" : "hover:text-gray-600"
                  }`}
                />
              </div>
            </div>

            {/* Action buttons */}
            <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleLike}
                    className={`transition-colors ${
                      isLiked
                        ? "text-red-500"
                        : "text-gray-400 hover:text-red-500"
                    }`}
                  >
                    <Heart
                      className={`w-6 h-6 ${isLiked ? "fill-current" : ""}`}
                    />
                  </button>
                  <button
                    onClick={handleBookmark}
                    className={`transition-colors ${
                      isBookmarked
                        ? "text-black dark:text-white"
                        : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    }`}
                  >
                    <Bookmark
                      className={`w-6 h-6 ${
                        isBookmarked ? "fill-current" : ""
                      }`}
                    />
                  </button>
                </div>
                <div className="text-sm text-gray-500">
                  {likesCount} {likesCount === 1 ? "like" : "likes"}
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 min-h-0">
              {comment?.length > 0 ? (
                <>
                  {comment.map((cmt) => (
                    <div key={cmt._id}>
                      <Comment
                        comment={cmt}
                        onReply={handleReply}
                        onShowReplies={handleShowReplies}
                        repliesCount={cmt.repliesCount || 0}
                      />
                      {/* Render replies when expanded */}
                      {expandedReplies.has(cmt._id) &&
                        cmt.replies &&
                        cmt.replies.length > 0 && (
                          <div className="mt-3 space-y-3">
                            {cmt.replies.map((reply) => (
                              <div key={reply._id} className="relative">
                                <Comment
                                  comment={reply}
                                  onReply={handleReply}
                                  onShowReplies={handleShowReplies}
                                  repliesCount={reply.repliesCount || 0}
                                />
                                {/* Nested replies for level 2 */}
                                {expandedReplies.has(reply._id) &&
                                  reply.replies &&
                                  reply.replies.length > 0 && (
                                    <div className="mt-3 space-y-3">
                                      {reply.replies.map((nestedReply) => (
                                        <Comment
                                          key={nestedReply._id}
                                          comment={nestedReply}
                                          onReply={handleReply}
                                          onShowReplies={handleShowReplies}
                                          repliesCount={
                                            nestedReply.repliesCount || 0
                                          }
                                        />
                                      ))}
                                    </div>
                                  )}
                              </div>
                            ))}

                            {/* Load more replies button */}
                            {repliesPagination[cmt._id]?.hasMore && (
                              <div className="flex justify-center mt-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleLoadMoreReplies(cmt)}
                                  className="text-sm text-blue-600 hover:text-blue-800"
                                >
                                  Xem thêm replies
                                </Button>
                              </div>
                            )}
                          </div>
                        )}
                    </div>
                  ))}
                  {hasMore && (
                    <div className="flex justify-center mt-2">
                      <Button
                        variant="ghost"
                        disabled={loading}
                        onClick={() => fetchComments(false)}
                      >
                        {loading ? "Đang tải..." : "Tải thêm"}
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  {loading ? "Đang tải..." : "No comments yet"}
                </div>
              )}
            </div>

            {/* Reply indicator */}
            {replyingTo && (
              <div
                className={`px-3 py-2 border-t flex items-center justify-between ${
                  isDark
                    ? "bg-blue-900/20 border-blue-700"
                    : "bg-blue-50 border-blue-200"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm text-blue-600">
                    Replying to <strong>@{replyingTo.author.username}</strong>
                  </span>
                </div>
                <button
                  onClick={cancelReply}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  {t("common.cancel")}
                </button>
              </div>
            )}

            {/* Input */}
            <div className="p-3 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={text}
                  onChange={changeEventHandler}
                  placeholder={
                    replyingTo
                      ? `Reply to @${replyingTo.author.username}...`
                      : "Add a comment..."
                  }
                  className={`w-full outline-none text-sm border-b py-1 bg-transparent focus:border-blue-500 transition-colors ${
                    isDark
                      ? "border-gray-600 text-white placeholder-gray-400"
                      : "border-gray-300 text-gray-900 placeholder-gray-500"
                  }`}
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
