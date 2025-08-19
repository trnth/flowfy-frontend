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
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setAuthUser } from "@/redux/authSlice";
import CreatePost from "./CreatePost";

const LeftSidebar = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((store) => store.auth);
  const logoutHandler = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/v1/user/logout", {
        withCredentials: true,
      });
      if (res.data.success) {
        dispatch(setAuthUser(null));
        navigate("/login");
        toast.success(res.data.message);
      }
    } catch (error) {
      toast.error(error.response.data.message);
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
    <div className="fixed top-0 z-10 left-0 px-4 border-r border-gray-300 lg:w-[16%] h-screen hidden md:block ">
      <div className="flex flex-col">
        <h1 className="text-center font-bold text-2xl mt-2 lg:pl-3">
          <span className="block lg:hidden">F</span>
          <span className="hidden lg:inline">Flowfy</span>
        </h1>
        {sidebarItems.map((item, index) => {
          return (
            <div
              onClick={() => sidebarHandler(item.text)}
              key={index}
              className="flex items-center gap-4 relative hover:bg-gray-100 cursor-pointer rounded-r-lg p-3"
            >
              {item.icon} <span className="hidden lg:inline">{item.text}</span>
            </div>
          );
        })}
      </div>
      <CreatePost open={open} setOpen={setOpen} />
    </div>
  );
};

export default LeftSidebar;
