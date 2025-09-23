import React, { useState, useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { AtSign, Heart, MessageCircle, Loader2 } from "lucide-react";
import useUserPosts from "@/hooks/useUserPosts";
import useUserProfile from "@/hooks/useUserProfile";
import useBookmarks from "@/hooks/useBookmarks";
import CommentDialog from "./CommentDialog";
import FollowDialog from "./FollowDialog";
import { setSelectedPost } from "@/redux/postSlice";
import { TfiLayoutGrid3Alt } from "react-icons/tfi";
import { FaRegBookmark } from "react-icons/fa";
import AvatarMenu from "./AvatarMenu";
import axios from "axios";
import { toast } from "sonner";
import { updateUserProfile } from "@/redux/userSlice";
import { setSelectedConversation } from "@/redux/chatSlice";
import store from "@/redux/store";

const Profile = () => {
  const [activeTab, setActiveTab] = useState("posts");
  const [isFollowDialogOpen, setIsFollowDialogOpen] = useState(false);
  const [followDialogTab, setFollowDialogTab] = useState("followers");
  const { id: userId } = useParams();
  const { loading } = useUserProfile(userId);
  const { profile } = useSelector((store) => store.auth);
  const { isCurrentUser } = useSelector((store) => store.user);
  const { userProfile } = useSelector((store) => store.user);
  const { userPost, bookmarks, userPostNextCursor, bookmarksNextCursor } =
    useSelector((store) => store.post);

  const {
    fetchUserPosts,
    resetPosts,
    hasMore: hasMorePosts,
    loading: postsLoading,
  } = useUserPosts(userProfile?._id);
  const {
    fetchBookmarks,
    resetBookmarks,
    hasMore: hasMoreBookmarks,
    loading: bookmarksLoading,
  } = useBookmarks(userProfile?._id);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [openComment, setOpenComment] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const loadMoreRef = useRef(null);

  useEffect(() => {
    if (!userProfile?._id) return;

    if (activeTab === "posts") {
      resetPosts();
      fetchUserPosts();
    } else if (activeTab === "saved") {
      resetBookmarks();
      fetchBookmarks();
    }
  }, [userProfile?._id, activeTab]);

  // Infinite scroll for posts/bookmarks
  useEffect(() => {
    if (!loadMoreRef.current || activeTab === "follow") return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          (activeTab === "posts" ? hasMorePosts : hasMoreBookmarks)
        ) {
          if (activeTab === "posts" && userPostNextCursor) {
            fetchUserPosts(userPostNextCursor);
          } else if (activeTab === "saved" && bookmarksNextCursor) {
            fetchBookmarks(bookmarksNextCursor);
          }
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(loadMoreRef.current);

    return () => observer.disconnect();
  }, [
    activeTab,
    hasMorePosts,
    hasMoreBookmarks,
    userPostNextCursor,
    bookmarksNextCursor,
    fetchUserPosts,
    fetchBookmarks,
  ]);

  const openFollowDialog = (tab) => {
    setFollowDialogTab(tab);
    setIsFollowDialogOpen(true);
  };

  const followHandler = async () => {
    setActionLoading(true);
    try {
      const res = await axios.post(
        `http://localhost:5000/api/v1/user/${userProfile._id}/follow`,
        {},
        { withCredentials: true }
      );
      if (res.data.success && res.data.data) {
        dispatch(
          updateUserProfile({
            ...userProfile,
            followers: res.data.data.followers,
            followings: res.data.data.followings,
            isFollowing: true,
            isAccepted: res.data.data.isAccepted,
          })
        );
        toast.success(res.data.message);
      } else {
        toast.error("Follow action failed: Invalid response");
      }
    } catch (error) {
      console.error(
        "Error in followHandler:",
        error.response?.data?.message || error.message
      );
      toast.error(error.response?.data?.message || "Follow action failed");
    } finally {
      setActionLoading(false);
    }
  };

  const unfollowHandler = async () => {
    setActionLoading(true);
    try {
      const res = await axios.delete(
        `http://localhost:5000/api/v1/user/${userProfile._id}/unfollow`,
        { withCredentials: true }
      );
      if (res.data.success && res.data.data) {
        dispatch(
          updateUserProfile({
            ...userProfile,
            followers: res.data.data.followers,
            followings: res.data.data.followings,
            isFollowing: false,
            isAccepted: false,
          })
        );
        toast.success(res.data.message);
      } else {
        toast.error("Unfollow action failed: Invalid response");
      }
    } catch (error) {
      console.error(
        "Error in unfollowHandler:",
        error.response?.data?.message || error.message
      );
      toast.error(error.response?.data?.message || "Unfollow action failed");
    } finally {
      setActionLoading(false);
    }
  };

  const cancelRequestHandler = async () => {
    setActionLoading(true);
    try {
      const res = await axios.delete(
        `http://localhost:5000/api/v1/user/follow/${userProfile._id}/cancel`,
        { withCredentials: true }
      );
      if (res.data.success) {
        dispatch(
          updateUserProfile({
            ...userProfile,
            isFollowing: false,
            isAccepted: false,
          })
        );
        toast.success(res.data.message);
      } else {
        toast.error("Cancel request failed: Invalid response");
      }
    } catch (error) {
      console.error(
        "Error in cancelRequestHandler:",
        error.response?.data?.message || error.message
      );
      toast.error(error.response?.data?.message || "Cancel request failed");
    } finally {
      setActionLoading(false);
    }
  };

  const openConversationHandler = async () => {
    if (!userProfile?._id) {
      toast.error("User profile not found");
      return;
    }

    try {
      const res = await axios.post(
        `http://localhost:5000/api/v1/message/conversation/${userProfile._id}`,
        {},
        { withCredentials: true }
      );
      if (res.data.success && res.data.conversation) {
        dispatch(
          setSelectedConversation({
            _id: res.data.conversationId,
            participants: res.data.conversation.participants,
            isGroup: false,
            lastRead: res.data.conversation.lastRead,
          })
        );
        navigate("/direct/inbox");
      } else {
        toast.error(res.data.error || "Failed to start conversation");
      }
    } catch (error) {
      console.error("Error in openConversationHandler:", error);
      toast.error(
        error.response?.data?.error || "Failed to start conversation"
      );
    }
  };
  if (loading) {
    return <p className="text-center py-10">Đang tải...</p>;
  }

  const displayedPost =
    activeTab === "posts" ? userPost : activeTab === "saved" ? bookmarks : [];

  return (
    <div className="flex max-w-4xl justify-center mx-auto pl-10">
      <div className="flex flex-col gap-8 p-8 w-full">
        <div className="grid grid-cols-2">
          {/* avatar */}
          <section className="flex items-center justify-center">
            {isCurrentUser ? (
              <AvatarMenu>
                <Avatar className="h-32 w-32 cursor-pointer">
                  <AvatarImage src={userProfile?.profilePicture} />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
              </AvatarMenu>
            ) : (
              <Link to={`/profile/${userProfile?.username}`}>
                <Avatar className="h-32 w-32">
                  <AvatarImage src={userProfile?.profilePicture} />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
              </Link>
            )}
          </section>

          {/* profile info */}
          <section>
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-2">
                <span>{userProfile?.username}</span>
                {isCurrentUser ? (
                  <>
                    <Link to="/accounts/edit">
                      <Button
                        variant="secondary"
                        className="hover:bg-gray-200 h-8"
                      >
                        Edit Profile
                      </Button>
                    </Link>
                    <Button
                      variant="secondary"
                      className="hover:bg-gray-200 h-8"
                    >
                      View archive
                    </Button>
                  </>
                ) : userProfile?.isFollowing && userProfile?.isAccepted ? (
                  <>
                    <Button
                      variant="secondary"
                      className="hover:bg-gray-200 h-8 flex items-center justify-center gap-1"
                      onClick={unfollowHandler}
                      disabled={actionLoading}
                    >
                      {actionLoading ? (
                        <Loader2 className="animate-spin h-4 w-4" />
                      ) : (
                        "Unfollow"
                      )}
                    </Button>
                    <Button
                      className="bg-[#0095F6] hover:bg-[#3192d2] h-8"
                      onClick={openConversationHandler}
                    >
                      Message
                    </Button>
                  </>
                ) : userProfile?.isFollowing ? (
                  <Button
                    variant="secondary"
                    className="hover:bg-gray-200 h-8 flex items-center justify-center gap-1"
                    onClick={cancelRequestHandler}
                    disabled={actionLoading}
                  >
                    {actionLoading ? (
                      <Loader2 className="animate-spin h-4 w-4" />
                    ) : (
                      "Pending Accept"
                    )}
                  </Button>
                ) : (
                  <Button
                    className="bg-[#0095F6] hover:bg-[#3192d2] h-8 flex items-center justify-center gap-1"
                    onClick={followHandler}
                    disabled={actionLoading}
                  >
                    {actionLoading ? (
                      <Loader2 className="animate-spin h-4 w-4" />
                    ) : (
                      "Follow"
                    )}
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-4">
                <p>
                  <span className="font-semibold">{userProfile?.posts}</span>{" "}
                  posts
                </p>
                <p
                  className="cursor-pointer hover:underline"
                  onClick={() => openFollowDialog("followers")}
                >
                  <span className="font-semibold">
                    {userProfile?.followers}
                  </span>{" "}
                  followers
                </p>
                <p
                  className="cursor-pointer hover:underline"
                  onClick={() => openFollowDialog("following")}
                >
                  <span className="font-semibold">
                    {userProfile?.followings}
                  </span>{" "}
                  following
                </p>
              </div>

              <div className="flex flex-col gap-1">
                <span className="font-semibold">{userProfile?.name}</span>
                <span>{userProfile?.bio}</span>
                <Badge className="w-fit" variant="secondary">
                  <AtSign />
                  <span className="pl-1">{userProfile?.username}</span>
                </Badge>
              </div>
            </div>
          </section>
        </div>

        {/* tabs */}
        <div>
          <div className="flex items-center justify-center gap-40 text-sm">
            <div
              className={`flex cursor-pointer px-4 pb-1 ${
                activeTab === "posts"
                  ? "text-black border-b-2 border-black"
                  : "text-gray-400"
              }`}
              onClick={() => setActiveTab("posts")}
            >
              <TfiLayoutGrid3Alt size={22} />
            </div>

            {isCurrentUser && (
              <div
                className={`flex cursor-pointer px-4 pb-1 ${
                  activeTab === "saved"
                    ? "text-black border-b-2 border-black"
                    : "text-gray-400"
                }`}
                onClick={() => setActiveTab("saved")}
              >
                <FaRegBookmark size={22} />
              </div>
            )}
          </div>

          {/* posts / bookmarks grid */}
          <div className="border-t border-t-gray-200">
            <div className="grid grid-cols-3 gap-1">
              {displayedPost?.map((post) => (
                <div
                  key={post?._id}
                  className="relative group cursor-pointer"
                  onClick={() => {
                    dispatch(setSelectedPost(post));
                    setOpenComment(true);
                  }}
                >
                  <img
                    src={post.images[0]}
                    alt="image"
                    className="rounded-sm mt-1 w-full aspect-square object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black opacity-0 group-hover:opacity-50 group-hover:mt-1 transition-opacity">
                    <div className="flex items-center text-white space-x-4">
                      <div className="flex items-center gap-2">
                        <Heart />
                        <span>{post?.likes}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MessageCircle />
                        <span>{post?.comments}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {(activeTab === "posts" ? hasMorePosts : hasMoreBookmarks) && (
              <div
                ref={loadMoreRef}
                className="h-10 flex items-center justify-center"
              >
                {(postsLoading || bookmarksLoading) && (
                  <p className="text-gray-500">Đang tải thêm...</p>
                )}
              </div>
            )}
          </div>

          <CommentDialog open={openComment} setOpen={setOpenComment} />
          <FollowDialog
            userId={userProfile?._id}
            isOpen={isFollowDialogOpen}
            onClose={() => setIsFollowDialogOpen(false)}
            initialTab={followDialogTab}
          />
        </div>
      </div>
    </div>
  );
};

export default Profile;
