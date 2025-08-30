import React from "react";
import { Outlet } from "react-router-dom";
import Feed from "@/components/Feed";
import useGetAllPost from "@/hooks/useGetNewFeed";
import useGetSuggestedUsers from "@/hooks/useGetSuggestedUsers";
import RightSidebar from "@/components/RightSiderbar";
const Home = () => {
  useGetAllPost();
  useGetSuggestedUsers();
  return (
    <div className="flex">
      <div className="flex-grow">
        <Feed />
        <Outlet />
      </div>
      <RightSidebar />
    </div>
  );
};

export default Home;
