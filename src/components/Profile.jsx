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
import { updateUserProfile } from "@/redux/userSlice";
import { setMessages, setSelectedConversation } from "@/redux/chatSlice";
import { useToast } from "@/contexts/ToastContext";
import store from "@/redux/store";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { getCommonClasses } from "@/utils/themeUtils";

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
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const { success, error } = useToast();
  const classes = getCommonClasses(isDark);

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

    // Reset activeTab to "posts" when switching users
    setActiveTab("posts");
  }, [userProfile?._id]);

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
        success("toast.success.followed");
      } else {
        error("toast.error.follow");
      }
    } catch (error) {
      console.error(
        "Error in followHandler:",
        error.response?.data?.message || error.message
      );
      error("toast.error.follow");
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
        success("toast.success.unfollowed");
      } else {
        error("toast.error.unfollow");
      }
    } catch (error) {
      console.error(
        "Error in unfollowHandler:",
        error.response?.data?.message || error.message
      );
      error("toast.error.unfollow");
    } finally {
      setActionLoading(false);
    }
  };

  const cancelRequestHandler = async () => {
    setActionLoading(true);
    try {
      const res = await axios.delete(
        `http://localhost:5000/api/v1/user/${userProfile._id}/follow/cancel`,
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
      if (res.data.success) {
        if (res.data.conversation) {
          // Conversation đã tồn tại
          dispatch(
            setSelectedConversation({
              _id: res.data.conversation._id,
              participants: res.data.conversation.participants,
              isGroup: false,
              lastRead: res.data.conversation.lastRead,
              unread: res.data.conversation.unread,
            })
          );
          dispatch(setMessages(res.data.messages));
        } else {
          // Conversation chưa tồn tại
          dispatch(
            setSelectedConversation({
              _id: `temp-${userProfile._id}`, // ID tạm thời
              participants: [profile._id, userProfile._id].sort(), // Sắp xếp participants
              isGroup: false,
              lastRead: new Map([
                [profile._id, null],
                [userProfile._id, null],
              ]),
              unread: false,
            })
          );
          dispatch(setMessages([])); // messages = 0
        }
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
    return (
      <p className="text-center py-10 text-slate-900 dark:text-slate-100">
        {t("common.loading")}
      </p>
    );
  }

  const displayedPost =
    activeTab === "posts"
      ? userPost
      : activeTab === "saved"
      ? bookmarks?.map((bookmark) => bookmark.post)
      : [];

  return (
    <div className="flex max-w-4xl justify-center mx-auto pl-10 bg-white dark:bg-slate-900">
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
                <span className="text-slate-900 dark:text-slate-100">
                  {userProfile?.username}
                </span>
                {isCurrentUser ? (
                  <>
                    <Link to="/accounts/edit">
                      <Button
                        variant="secondary"
                        className="bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:bg-slate-700 h-8"
                      >
                        {t("settings.editProfile")}
                      </Button>
                    </Link>
                    <Button
                      variant="secondary"
                      className="bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:bg-slate-700 h-8"
                    >
                      {t("profile.viewArchive")}
                    </Button>
                  </>
                ) : userProfile?.isFollowing && userProfile?.isAccepted ? (
                  <>
                    <Button
                      variant="secondary"
                      className="bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:bg-slate-700 h-8 flex items-center justify-center gap-1"
                      onClick={unfollowHandler}
                      disabled={actionLoading}
                    >
                      {actionLoading ? (
                        <Loader2 className="animate-spin h-4 w-4" />
                      ) : (
                        t("profile.unfollow")
                      )}
                    </Button>
                    <Button
                      className="text-blue-600-bg hover:text-blue-600-hover text-white h-8"
                      onClick={openConversationHandler}
                    >
                      {t("profile.message")}
                    </Button>
                  </>
                ) : userProfile?.isFollowing ? (
                  <Button
                    variant="secondary"
                    className="bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:bg-slate-700 h-8 flex items-center justify-center gap-1"
                    onClick={cancelRequestHandler}
                    disabled={actionLoading}
                  >
                    {actionLoading ? (
                      <Loader2 className="animate-spin h-4 w-4" />
                    ) : (
                      t("profile.pendingAccept")
                    )}
                  </Button>
                ) : (
                  <Button
                    className="text-blue-600-bg hover:text-blue-600-hover text-white h-8 flex items-center justify-center gap-1"
                    onClick={followHandler}
                    disabled={actionLoading}
                  >
                    {actionLoading ? (
                      <Loader2 className="animate-spin h-4 w-4" />
                    ) : (
                      t("profile.follow")
                    )}
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-4">
                <p className="text-slate-900 dark:text-slate-100">
                  <span className="font-semibold">{userProfile?.posts}</span>{" "}
                  {t("profile.posts")}
                </p>
                <p
                  className="cursor-pointer hover:underline text-slate-900 dark:text-slate-100"
                  onClick={() => openFollowDialog("followers")}
                >
                  <span className="font-semibold">
                    {userProfile?.followers}
                  </span>{" "}
                  {t("profile.followers")}
                </p>
                <p
                  className="cursor-pointer hover:underline text-slate-900 dark:text-slate-100"
                  onClick={() => openFollowDialog("following")}
                >
                  <span className="font-semibold">
                    {userProfile?.followings}
                  </span>{" "}
                  {t("profile.following")}
                </p>
              </div>

              <div className="flex flex-col gap-1">
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {userProfile?.name}
                </span>
                <span className="text-slate-600 dark:text-slate-300">
                  {userProfile?.bio}
                </span>
                <Badge
                  className="w-fit bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  variant="secondary"
                >
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
                  ? "theme-text-primary border-b-2 theme-border-primary"
                  : "theme-text-tertiary"
              }`}
              onClick={() => setActiveTab("posts")}
            >
              <TfiLayoutGrid3Alt size={22} />
            </div>

            {isCurrentUser && (
              <div
                className={`flex cursor-pointer px-4 pb-1 ${
                  activeTab === "saved"
                    ? "theme-text-primary border-b-2 theme-border-primary"
                    : "theme-text-tertiary"
                }`}
                onClick={() => setActiveTab("saved")}
              >
                <FaRegBookmark size={22} />
              </div>
            )}
          </div>

          {/* posts / bookmarks grid */}
          <div className="border-t border-slate-200 dark:border-slate-700">
            {displayedPost && displayedPost.length > 0 ? (
              <div className="grid grid-cols-3 gap-1">
                {displayedPost.map((post) => (
                  <div
                    key={post?._id}
                    className="relative group cursor-pointer"
                    onClick={() => {
                      dispatch(setSelectedPost(post));
                      setOpenComment(true);
                    }}
                  >
                    <img
                      src={post?.images?.[0] || "/placeholder-image.jpg"}
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
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                  {activeTab === "posts" ? (
                    <TfiLayoutGrid3Alt size={24} className="text-slate-400" />
                  ) : (
                    <FaRegBookmark size={24} className="text-slate-400" />
                  )}
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  {activeTab === "posts"
                    ? t("profile.noPosts")
                    : t("profile.noBookmarks")}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  {activeTab === "posts"
                    ? isCurrentUser
                      ? t("profile.noPostsDesc")
                      : t("profile.noPostsDescOther")
                    : t("profile.noBookmarksDesc")}
                </p>
              </div>
            )}

            {(activeTab === "posts" ? hasMorePosts : hasMoreBookmarks) && (
              <div
                ref={loadMoreRef}
                className="h-10 flex items-center justify-center"
              >
                {(postsLoading || bookmarksLoading) && (
                  <p className="text-slate-600 dark:text-slate-300">
                    {t("profile.loadingMore")}
                  </p>
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
