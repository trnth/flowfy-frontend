import {
  Home,
  MessageCircle,
  Search,
  TrendingUp,
  Heart,
  PlusSquare,
  LogOut,
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import React, { useState } from "react";
import { toast } from "sonner";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setAuth } from "@/redux/authSlice";
import { resetPosts } from "@/redux/postSlice";
import { resetSocket } from "@/redux/socketSlice";
import { resetChat } from "@/redux/chatSlice";
import CreatePost from "./CreatePost";
import { resetNotification } from "@/redux/notificationSlice";
import SearchPage from "./SearchPage";
import NotificationPage from "./NotificationPage";

const LeftSidebar = () => {
  const [open, setOpen] = useState(false);
  const [openSearch, setOpenSearch] = useState(false);
  const [openNotifications, setOpenNotifications] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((store) => store.auth);
  const location = useLocation();
  const isInboxPage = location.pathname.startsWith("/direct/inbox");
  const { notifications } = useSelector((store) => store.notification);

  if (!user) return null;
  const logoutHandler = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/v1/auth/logout", {
        withCredentials: true,
      });
      dispatch(resetAuth());
      dispatch(resetPosts());
      dispatch(resetSocket());
      dispatch(resetChat());
      dispatch(resetNotification());
      if (res.data.success) {
        dispatch(setAuthUser(null));
        navigate("/login");
        toast.success(res.data.message);
      }
    } catch (error) {
      console.error("Lỗi đăng xuất:", error);
    }
  };

  const sidebarHandler = (textType) => {
    console.log({ textType, open, openSearch, openNotifications });
    if (textType === "LogOut") {
      logoutHandler();
    } else if (textType === "Create") {
      setOpen(!open);
      setOpenSearch(false);
      setOpenNotifications(false);
    } else if (textType === "Profile") {
      navigate(`/profile/${user._id}`);
      setOpen(false);
      setOpenSearch(false);
      setOpenNotifications(false);
    } else if (textType === "Home") {
      navigate("/");
      setOpen(false);
      setOpenSearch(false);
      setOpenNotifications(false);
    } else if (textType === "Message") {
      navigate("/direct/inbox");
      setOpen(false);
      setOpenSearch(false);
      setOpenNotifications(false);
    } else if (textType === "Search") {
      setOpenSearch(!openSearch);
      setOpen(false);
      setOpenNotifications(false);
    } else if (textType === "Notifications") {
      setOpenNotifications(!openNotifications);
      setOpen(false);
      setOpenSearch(false);
    }
  };

  const sidebarItems = [
    { icon: <Home />, text: "Home" },
    { icon: <Search />, text: "Search" },
    { icon: <TrendingUp />, text: "Explore" },
    { icon: <MessageCircle />, text: "Message" },
    { icon: <Heart />, text: "Notifications" },
    { icon: <PlusSquare />, text: "Create" },
    {
      icon: (
        <Avatar className="w-6 h-6">
          <AvatarImage src={user?.profilePicture} alt="@shadcn" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      ),
      text: "Profile",
    },
    { icon: <LogOut />, text: "LogOut" },
  ];

  return (
    <>
      <div
        className={`fixed top-0 z-30 left-0 px-4 border-r border-gray-300 h-screen hidden md:block transition-all duration-300 ease-in-out ${
          isInboxPage || openSearch || openNotifications
            ? "w-[80px]"
            : "w-[60px] md:w-[80px] lg:w-[16%]"
        }`}
      >
        <div className="flex flex-col">
          <h1
            className={`text-center font-bold text-2xl my-4 lg:pl-3 px-3 transition-opacity duration-300 ease-in-out`}
          >
            <span
              className={`${
                isInboxPage || openSearch || openNotifications
                  ? "block"
                  : "block lg:hidden"
              }`}
            >
              F
            </span>
            <span
              className={`${
                isInboxPage || openSearch || openNotifications
                  ? "opacity-0 absolute"
                  : "hidden lg:inline"
              }`}
            >
              Flowfy
            </span>
          </h1>

          {sidebarItems.map((item, index) => (
            <div
              onClick={() => sidebarHandler(item.text)}
              key={index}
              className="flex items-center gap-4 relative hover:bg-gray-100 cursor-pointer rounded-lg p-3"
            >
              {item.icon}
              {!(isInboxPage || openSearch || openNotifications) && (
                <span className="hidden lg:inline">{item.text}</span>
              )}
              {item.text === "Notifications" && notifications?.length > 0 && (
                <div className="rounded-full h-5 w-5 bg-red-600 text-white text-xs flex items-center justify-center absolute bottom-6 left-6">
                  {notifications.length}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <CreatePost open={open} setOpen={setOpen} />
      <SearchPage open={openSearch} setOpen={setOpenSearch} />
      <NotificationPage
        open={openNotifications}
        setOpen={setOpenNotifications}
      />
    </>
  );
};

export default LeftSidebar;
