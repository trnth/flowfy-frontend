import store from "@/redux/store";
import React from "react";
import { useSelector } from "react-redux";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Link } from "react-router-dom";
import SuggestedUsers from "./SuggestedUsers";

const RightSidebar = () => {
  const { profile } = useSelector((store) => store.auth);
  return (
    <div className="w-[300px] my-10 mr-30 pr-5  top-0 right-0 h-screen hidden lg:block z-10">
      <div className="flex items-center gap-4 p-4">
        <Link to={`/profile/${profile?._id}`}>
          <Avatar className="w-12 h-12">
            <AvatarImage
              src={profile?.profilePicture}
              alt="user_profilePicture"
            />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </Link>
        <div>
          <h1 className="font-semibold text-sm">
            <Link to={`/profile/${profile?._id}`}>{profile?.username}</Link>
          </h1>
          <span className="text-gray-600 text-sm">
            {profile?.name || "Name here..."}
          </span>
        </div>
      </div>
      <SuggestedUsers />
    </div>
  );
};

export default RightSidebar;
