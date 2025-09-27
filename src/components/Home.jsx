import React from "react";
import { Outlet } from "react-router-dom";
import Feed from "@/components/Feed";
import useGetSuggestedUsers from "@/hooks/useGetSuggestedUsers";
import RightSidebar from "@/components/RightSiderbar";
import useGetNewFeed from "@/hooks/useGetNewFeed";
import { useTheme } from "@/contexts/ThemeContext";

const Home = () => {
  useGetNewFeed();
  useGetSuggestedUsers();
  const { isDark } = useTheme();
  
  return (
    <div className="flex bg-white dark:bg-slate-900">
      <div className="flex-grow">
        <Feed />
        <Outlet />
      </div>
      <RightSidebar />
    </div>
  );
};

export default Home;
