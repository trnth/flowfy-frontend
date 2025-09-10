import React from "react";
import { Outlet } from "react-router-dom";
import Feed from "@/components/Feed";
import useGetSuggestedUsers from "@/hooks/useGetSuggestedUsers";
import RightSidebar from "@/components/RightSiderbar";
import useGetNewFeed from "@/hooks/useGetNewFeed";
const Home = () => {
  useGetNewFeed();
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
