import React, { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { AtSign, Heart, MessageCircle } from "lucide-react";
import useUserPosts from "@/hooks/useUserPosts";
import useUserProfile from "@/hooks/useUserProfile";
import useBookmarks from "@/hooks/useBookmarks";
import CommentDialog from "./CommentDialog";
import { setSelectedPost } from "@/redux/postSlice";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import useEditAvatarDialog from "@/hooks/useEditAvatarDialog";

const Profile = () => {
  const [activeTab, setActiveTab] = useState("posts");
  const { id: userId } = useParams();
  const isCurrentUser = useUserProfile(userId);
  const authUser = useSelector((store) => store.auth.user);
  const otherUser = useSelector((store) => store.user.userProfile);

  const userProfile = isCurrentUser ? authUser : otherUser;
  const { fetchUserPosts, resetPosts } = useUserPosts(userProfile?._id);
  const { fetchBookmarks, resetBookmarks } = useBookmarks(userProfile?._id);
  const { userPost, bookmarks } = useSelector((store) => store.user);

  const dispatch = useDispatch();
  const [openComment, setOpenComment] = useState(false);
  // hooks

  // avatar hook
  const {
    FileInput,
    triggerFileInput,
    Dialog: AvatarDialog,
  } = useEditAvatarDialog();

  useEffect(() => {
    if (activeTab === "posts") {
      resetPosts();
      fetchUserPosts();
    } else if (activeTab === "saved") {
      resetBookmarks();
      fetchBookmarks();
    }
  }, userProfile?._id);

  if (!userProfile) {
    return <p className="text-center py-10">Đang tải ...</p>;
  }

  const isFollowing = userProfile?.isFollowing;

  const displayedPost =
    activeTab === "posts" ? userPost : activeTab === "saved" ? bookmarks : [];

  return (
    <div className="flex max-w-4xl justify-center mx-auto pl-10">
      <div className="flex flex-col gap-20 p-8">
        <div className="grid grid-cols-2">
          {/* avatar */}
          <section className="flex items-center justify-center">
            {isCurrentUser ? (
              <>
                <Avatar
                  className="h-32 w-32 cursor-pointer"
                  onClick={triggerFileInput}
                >
                  <AvatarImage src={userProfile?.profilePicture} />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                {FileInput}
                {AvatarDialog}
              </>
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
                ) : isFollowing ? (
                  <>
                    <Button
                      variant="secondary"
                      className="hover:bg-gray-200 h-8"
                    >
                      Unfollow
                    </Button>
                    <Button className="bg-[#0095F6] hover:bg-[#3192d2] h-8">
                      Message
                    </Button>
                  </>
                ) : (
                  <Button className="bg-[#0095F6] hover:bg-[#3192d2] h-8">
                    Follow
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-4">
                <p>
                  <span className="font-semibold">{userProfile?.posts}</span>{" "}
                  posts
                </p>
                <p>
                  <span className="font-semibold">
                    {userProfile?.followers}
                  </span>{" "}
                  followers
                </p>
                <p>
                  <span className="font-semibold">
                    {userProfile?.following}
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
        <div className="border-t border-t-gray-200">
          <div className="flex items-center justify-center gap-10 text-sm">
            <span
              className={`py-3 cursor-pointer ${
                activeTab === "posts" ? "font-bold" : ""
              }`}
              onClick={() => setActiveTab("posts")}
            >
              POSTS
            </span>
            <span
              className={`py-3 cursor-pointer ${
                activeTab === "saved" ? "font-bold" : ""
              }`}
              onClick={() => setActiveTab("saved")}
            >
              SAVED
            </span>
            <span
              className={`py-3 cursor-pointer ${
                activeTab === "reels" ? "font-bold" : ""
              }`}
              onClick={() => setActiveTab("reels")}
            >
              Reels
            </span>
          </div>

          {/* posts / bookmarks grid */}
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

          <CommentDialog open={openComment} setOpen={setOpenComment} />
        </div>
      </div>
    </div>
  );
};

export default Profile;
