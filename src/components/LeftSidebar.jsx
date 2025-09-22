import {
  Home,
  MessageCircle,
  Search,
  TrendingUp,
  Heart,
  PlusSquare,
  LogOut,
  Settings,
  Clock,
  MoreHorizontal,
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import React, { useState } from "react";
import { toast } from "sonner";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { resetAuth } from "@/redux/authSlice";
import { resetPost } from "@/redux/postSlice";
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
  const { profile } = useSelector((store) => store.auth);
  const location = useLocation();
  const isInboxPage = location.pathname.startsWith("/direct/inbox");
  const { notifications } = useSelector((store) => store.notification);

  if (!profile) return null;

  const logoutHandler = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/v1/auth/logout", {
        withCredentials: true,
      });
      dispatch(resetAuth());
      dispatch(resetPost());
      dispatch(resetSocket());
      dispatch(resetChat());
      dispatch(resetNotification());
      if (res.data.success) {
        navigate("/login");
        toast.success(res.data.message);
      }
    } catch (error) {
      console.error("Lỗi đăng xuất:", error);
    }
  };

  const sidebarHandler = (textType) => {
    if (textType === "LogOut") {
      logoutHandler();
    } else if (textType === "Create") {
      setOpen(!open);
      setOpenSearch(false);
      setOpenNotifications(false);
    } else if (textType === "Profile") {
      navigate(`/profile/${profile?.username}`);
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

  const sidebarItemsTop = [
    { icon: <Home />, text: "Home" },
    { icon: <Search />, text: "Search" },
    { icon: <TrendingUp />, text: "Explore" },
    { icon: <MessageCircle />, text: "Message" },
    { icon: <Heart />, text: "Notifications" },
    { icon: <PlusSquare />, text: "Create" },
    {
      icon: (
        <Avatar className="w-6 h-6">
          <AvatarImage src={profile?.profilePicture} alt="@shadcn" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      ),
      text: "Profile",
    },
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
        <div className="flex flex-col h-full justify-between relative">
          {/* Nhóm trên */}
          <div>
            <h1 className="text-center font-bold text-2xl my-4 lg:pl-3 px-3">
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

            {sidebarItemsTop.map((item, index) => (
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

          {/* Nút More ở dưới */}
          <div className="mb-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-4 hover:bg-gray-100 cursor-pointer rounded-lg p-3">
                  <MoreHorizontal />
                  {!(isInboxPage || openSearch || openNotifications) && (
                    <span className="hidden lg:inline">More</span>
                  )}
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top" // xổ lên
                align="start"
                className="w-48 rounded-xl"
              >
                <DropdownMenuItem
                  onClick={() => navigate("/accounts/edit")}
                  className="flex items-center gap-2"
                >
                  <Settings size={20} /> Settings
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => toast.info("View Activity")}
                  className="flex items-center gap-2"
                >
                  <Clock size={20} /> Activity
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={logoutHandler}
                  className="flex items-center gap-2 text-red-500"
                >
                  <LogOut size={20} /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
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
