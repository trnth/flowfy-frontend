import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import useGetUserProfile from "@/hooks/useGetUserProfile";
import { Link, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import store from "@/redux/store";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { AtSign, Heart, MessageCircle } from "lucide-react";

const Profile = () => {
  const { id: userId } = useParams();
  useGetUserProfile(userId);
  const { userProfile, user } = useSelector((store) => store.auth);
  console.log(userProfile);
  const [activeTab, setActiveTab] = useState("posts");
  const isLoggedInUserProfile = user?._id == userProfile?._id;
  const isFollowing = true;
  const handelTabChanged = (tab) => {
    setActiveTab(tab);
  };

  const displayedPost =
    activeTab == "posts" ? userProfile?.posts : userProfile?.bookmarks;
  return (
    <div className="flex max-w-4xl justify-center mx-auto pl-10">
      <div className="flex flex-col gap-20 p-8">
        <div className="grid grid-cols-2">
          <section className="flex items-center justify-center">
            <Avatar className="h-32 w-32">
              <AvatarImage src={userProfile?.profilePicture} />
              <AvatarFallback> CN</AvatarFallback>
            </Avatar>
          </section>
          <section>
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-2">
                <span>{userProfile?.username}</span>
                {isLoggedInUserProfile ? (
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
                    <Button
                      variant="secondary"
                      className="hover:bg-gray-200 h-8"
                    >
                      Ad tools
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
                  <span className="font-semibold">
                    {userProfile?.posts.length}
                  </span>{" "}
                  posts
                </p>
                <p>
                  <span className="font-semibold">
                    {userProfile?.followers.length}
                  </span>{" "}
                  followers
                </p>
                <p>
                  <span className="font-semibold">
                    {userProfile?.following.length}
                  </span>{" "}
                  following
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-semibold">{userProfile?.name}</span>
                <span className="">{userProfile?.bio}</span>
                <Badge className="w-fit" variant="secondary">
                  <AtSign />{" "}
                  <span className="pl-1">{userProfile?.username}</span>
                </Badge>
              </div>
            </div>
          </section>
        </div>
        <div className="border-t border-t-gray-200 ">
          <div className="flex items-center justify-center gap-10 text-sm">
            <span
              className="py-3 cursor-pointer"
              onClick={() => handelTabChanged("posts")}
            >
              POSTS
            </span>
            <span
              className="py-3 cursor-pointer"
              onClick={() => handelTabChanged("saved")}
            >
              SAVED
            </span>
            <span
              className="py-3 cursor-pointer"
              onClick={() => handelTabChanged("reels")}
            >
              REELS
            </span>
            <span
              className="py-3 cursor-pointer"
              onClick={() => handelTabChanged("tags")}
            >
              TAGS
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1">
            {displayedPost?.map((post) => {
              return (
                <div key={post?._id} className="relative group cursor-pointer">
                  <img
                    src={post.image}
                    alt="image"
                    className="rounded-sm mt-1 w-full aspect-square object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black opacity-0 group-hover:opacity-50 transition-opacity">
                    <div className="flex items-center text-white space-x-4">
                      <Button className="flex items-center gap-2 hover:text-gray-300">
                        <Heart />
                        <span>{post?.likes.length}</span>
                      </Button>
                      <Button className="flex items-center gap-2 hover:text-gray-300">
                        <MessageCircle />
                        <span>{post?.comments.length}</span>
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
