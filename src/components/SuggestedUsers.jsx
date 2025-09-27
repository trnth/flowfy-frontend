import store from "@/redux/store";
import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";

const SuggestedUsers = () => {
  const { suggestedUsers } = useSelector((store) => store.auth);
  const { isDark } = useTheme();
  const { t } = useLanguage();
  
  return (
    <div className="my-10">
      <div className="flex items-center justify-between text-sm ">
        <h1 className="font-semibold text-slate-600 dark:text-slate-300">{t('feed.suggestedForYou')}</h1>
        <span className="font-medium cursor-pointer text-slate-900 dark:text-slate-100">{t('feed.seeAll')}</span>
      </div>
      {suggestedUsers?.map((user) => {
        return (
          <div
            key={user._id}
            className="flex items-center justify-between gap-2 "
          >
            <div className="flex items-center gap-2 ">
              <Link to={`/profile/${user?._id}`}>
                <Avatar className="w-10 h-10">
                  <AvatarImage
                    src={user?.profilePicture}
                    alt="user_profilePicture"
                  />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
              </Link>
              <div>
                <h1 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                  <Link to={`/profile/${user?._id}`}>{user?.username}</Link>
                </h1>
                <span className="text-slate-600 dark:text-slate-300 text-sm">
                  {user?.bio || "Bio here..."}
                </span>
              </div>
            </div>
                <span className="text-blue-600 text-xs font-bold cursor-pointer hover:text-blue-600-hover">
                  {t('feed.follow')}
                </span>
          </div>
        );
      })}
    </div>
  );
};

export default SuggestedUsers;
