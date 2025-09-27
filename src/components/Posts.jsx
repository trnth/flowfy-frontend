import React from "react";
import Post from "./Post";
import { useSelector } from "react-redux";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";

const Posts = () => {
  const { posts } = useSelector((store) => store.post);
  const { isDark } = useTheme();
  const { t } = useLanguage();

  if (!posts || posts.length === 0) {
      return (
        <div className="text-center mt-4 text-slate-600 dark:text-slate-300">
          {t('feed.followMore')}
        </div>
      );
  }

  return (
    <div>
      {posts.map((post) => (
        <Post key={post._id} post={post} />
      ))}
    </div>
  );
};

export default Posts;
