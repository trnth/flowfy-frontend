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
import NotificationDialog from "./NotificationDialog";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/contexts/ToastContext";
import { getCommonClasses } from "@/utils/themeUtils";

const LeftSidebar = () => {
  const [open, setOpen] = useState(false);
  const [openSearch, setOpenSearch] = useState(false);
  const [openNotifications, setOpenNotifications] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { profile } = useSelector((store) => store.auth);
  const location = useLocation();
  const isInboxPage = location.pathname.startsWith("/direct/inbox");
  const isSettingsPage = location.pathname.startsWith("/accounts/edit");
  const { notifications } = useSelector((store) => store.notification);
  const unreadCount = notifications.filter((n) => n && !n.isRead).length;
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const { success, error } = useToast();
  const classes = getCommonClasses(isDark);

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
        success("toast.success.logout");
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
    { icon: <Home />, text: t("sidebar.home") || "Home", key: "Home" },
    { icon: <Search />, text: t("sidebar.search") || "Search", key: "Search" },
    {
      icon: <TrendingUp />,
      text: t("sidebar.explore") || "Explore",
      key: "Explore",
    },
    {
      icon: <MessageCircle />,
      text: t("sidebar.message") || "Message",
      key: "Message",
    },
    {
      icon: <Heart />,
      text: t("sidebar.notifications") || "Notifications",
      key: "Notifications",
    },
    {
      icon: <PlusSquare />,
      text: t("sidebar.create") || "Create",
      key: "Create",
    },
    {
      icon: (
        <Avatar className="w-6 h-6">
          <AvatarImage src={profile?.profilePicture} alt="@shadcn" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      ),
      text: t("sidebar.profile") || "Profile",
      key: "Profile",
    },
  ];

  return (
    <>
      <div
        className={`fixed top-0 z-30 left-0 px-4 border-r h-screen transition-all duration-300 ease-in-out ${
          isInboxPage || openSearch || openNotifications || isSettingsPage
            ? "w-[80px]"
            : "w-[60px] md:w-[80px] lg:w-[16%]"
        } ${
          isDark ? "bg-gray-900 border-gray-700" : "bg-white border-gray-300"
        }`}
      >
        <div className="flex flex-col h-full justify-between relative">
          {/* Nhóm trên */}
          <div className="flex-1">
            <h1
              className={`text-center font-bold text-2xl my-4 lg:pl-3 px-3 ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              <span
                className={`${
                  isInboxPage ||
                  openSearch ||
                  openNotifications ||
                  isSettingsPage
                    ? "block"
                    : "block lg:hidden"
                }`}
              >
                F
              </span>
              <span
                className={`${
                  isInboxPage ||
                  openSearch ||
                  openNotifications ||
                  isSettingsPage
                    ? "opacity-0 absolute"
                    : "hidden lg:inline"
                }`}
              >
                Flowfy
              </span>
            </h1>

            {sidebarItemsTop.map((item, index) => (
              <div
                onClick={() => sidebarHandler(item.key)}
                key={index}
                className={`flex items-center gap-4 relative cursor-pointer rounded-lg p-3 transition-colors ${
                  isDark
                    ? "hover:bg-gray-800 text-gray-300 hover:text-white"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
              >
                {item.icon}
                {!(
                  isInboxPage ||
                  openSearch ||
                  openNotifications ||
                  isSettingsPage
                ) && <span className="hidden lg:inline">{item.text}</span>}
                {item.key === "Notifications" && unreadCount > 0 && (
                  <div className="rounded-full h-5 w-5 bg-red-600 text-white text-xs flex items-center justify-center absolute bottom-6 left-6">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Nút More ở dưới */}
          <div className="mt-auto mb-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div
                  className={`flex items-center gap-4 cursor-pointer rounded-lg p-3 transition-colors ${
                    isDark
                      ? "hover:bg-gray-800 text-gray-300 hover:text-white"
                      : "hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  <MoreHorizontal />
                  {!(
                    isInboxPage ||
                    openSearch ||
                    openNotifications ||
                    isSettingsPage
                  ) && (
                    <span className="hidden lg:inline">
                      {t("sidebar.more") || "More"}
                    </span>
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
                  <Settings size={20} /> {t("sidebar.settings") || "Settings"}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => toast.info("View Activity")}
                  className="flex items-center gap-2"
                >
                  <Clock size={20} /> {t("sidebar.activity") || "Activity"}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={logoutHandler}
                  className="flex items-center gap-2 text-red-500"
                >
                  <LogOut size={20} /> {t("sidebar.logout") || "Logout"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <CreatePost open={open} setOpen={setOpen} />
      <SearchPage open={openSearch} setOpen={setOpenSearch} />
      <NotificationDialog
        open={openNotifications}
        setOpen={setOpenNotifications}
      />
    </>
  );
};

export default LeftSidebar;
