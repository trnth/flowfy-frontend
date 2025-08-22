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
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setAuthUser, resetAuth, setSelectedUser } from "@/redux/authSlice";
import { resetPosts } from "@/redux/postSlice";
import { resetSocket } from "@/redux/socketSlice";
import { resetChat } from "@/redux/chatSlice";
import CreatePost from "./CreatePost";

const LeftSidebar = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((store) => store.auth);
  const location = useLocation();
  const isInboxPage = location.pathname.startsWith("/direct/inbox");
  const logoutHandler = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/v1/auth/logout", {
        withCredentials: true,
      });
      dispatch(resetAuth());
      dispatch(resetPosts());
      dispatch(resetSocket());
      dispatch(resetChat());
      if (res.data.success) {
        dispatch(setAuthUser(null));
        navigate("/login");
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
      //toast.error(error.response.data.message);
    }
  };
  const sidebarHandler = (textType) => {
    if (textType == "LogOut") {
      logoutHandler();
    } else if (textType == "Create") {
      setOpen(true);
    } else if (textType == "Profile") {
      navigate(`/profile/${user?._id}`);
    } else if (textType == "Home") {
      navigate("/");
    } else if (textType == "Message") {
      navigate("/direct/inbox");
    }
  };
  const sidebarItems = [
    {
      icon: <Home />,
      text: "Home",
    },
    {
      icon: <Search />,
      text: "Search",
    },
    {
      icon: <TrendingUp />,
      text: "Explore",
    },
    {
      icon: <MessageCircle />,
      text: "Message",
    },
    {
      icon: <Heart />,
      text: "Notification",
    },
    {
      icon: <PlusSquare />,
      text: "Create",
    },
    {
      icon: (
        <Avatar className="w-6 h-6">
          <AvatarImage src={user?.profilePicture} alt="@shadcn" />
          <AvatarFallback> CN</AvatarFallback>
        </Avatar>
      ),
      text: "Profile",
    },
    {
      icon: <LogOut />,
      text: "LogOut",
    },
  ];
  return (
    <div
      className={`fixed top-0 z-10 left-0 px-4 border-r border-gray-300 h-screen hidden md:block transition-all duration-300 ease-in-out
        ${isInboxPage ? "w-[80px]" : "w-[60px] md:w-[80px] lg:w-[16%]"}
      `}
    >
      <div className="flex flex-col">
        <h1
          className={`text-center font-bold text-2xl my-4 lg:pl-3 px-3
          transition-opacity duration-300 ease-in-out
        `}
        >
          <span className={`${isInboxPage ? "block" : "block lg:hidden"}`}>
            F
          </span>
          <span
            className={`${
              isInboxPage ? "opacity-0 absolute" : "hidden lg:inline"
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
            {!isInboxPage && (
              <span className="hidden lg:inline">{item.text}</span>
            )}
          </div>
        ))}
      </div>

      <CreatePost open={open} setOpen={setOpen} />
    </div>
  );
};

export default LeftSidebar;
