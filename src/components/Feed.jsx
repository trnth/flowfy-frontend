import React from "react";
import Posts from "@/components/Posts";
import { useTheme } from "@/contexts/ThemeContext";

const Feed = () => {
  const { isDark } = useTheme();
  
  return (
    <div className="flex-1 my-8 flex flex-col items-center md:pl-[20%] bg-white dark:bg-slate-900">
      <Posts />
    </div>
  );
};

export default Feed;
