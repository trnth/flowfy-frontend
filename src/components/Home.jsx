import React from "react";
import { Outlet } from "react-router-dom";
import Feed from "@/components/Feed";
import RightSiderbar from "@/components/RightSiderbar";
import useGetAllPost from "@/hooks/useGetAllPost";
const Home = () => {
  useGetAllPost();
  return (
    <div className="flex">
      <div className="flex-grow">
        <Feed />
        <Outlet />
      </div>
      <RightSiderbar />
    </div>
  );
};

export default Home;
