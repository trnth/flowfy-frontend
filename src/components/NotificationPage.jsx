import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const NotificationPage = ({ open, setOpen }) => {
  const { notifications } = useSelector((store) => store.notification);
  const navigate = useNavigate();

  return (
    <div
      className={`fixed top-0 left-[80px] w-[calc(100%-80px)] md:w-[350px] h-screen bg-white z-20 transition-all duration-300 ease-in-out ${
        open ? "translate-x-0 border-r border-gray-300" : "-translate-x-full "
      }`}
    >
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Thông báo</h2>
        {notifications.length === 0 ? (
          <p>Không có thông báo mới</p>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.userId}
                className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg cursor-pointer"
                onClick={() =>
                  navigate(`/profile/${notification.userDetail?._id}`)
                }
              >
                <Avatar className="w-10 h-10">
                  <AvatarImage src={notification.userDetail?.profilePicture} />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm">
                    <span className="font-bold">
                      {notification.userDetail?.username}
                    </span>{" "}
                    đã thích bài viết của bạn
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(notification.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationPage;
