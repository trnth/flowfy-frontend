import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { useFollowers, useFollowing } from "../hooks/useFollowHooks";
import { Dialog, DialogContent } from "./ui/dialog";
import { X } from "lucide-react";
import { toast } from "sonner";
import { removeFollower, removeFollowing } from "../redux/followSlice";
import { Link } from "react-router-dom";

const FollowDialog = ({
  userId,
  isOpen,
  onClose,
  initialTab = "followers",
}) => {
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.auth.profile);
  const isCurrentUser = userId === currentUser?._id;
  const [activeTab, setActiveTab] = useState(initialTab);
  const {
    followers,
    nextCursor: followersNextCursor,
    loading: followersLoading,
    error: followersError,
    loadMore: loadMoreFollowers,
  } = useFollowers(userId, currentUser?._id);
  const {
    following,
    nextCursor: followingNextCursor,
    loading: followingLoading,
    error: followingError,
    loadMore: loadMoreFollowing,
  } = useFollowing(userId, currentUser?._id);
  const observerRef = useRef(null);
  const loadMoreRef = useRef(null);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (!isOpen || !loadMoreRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          (activeTab === "followers"
            ? followersNextCursor
            : followingNextCursor)
        ) {
          if (activeTab === "followers") {
            loadMoreFollowers();
          } else {
            loadMoreFollowing();
          }
        }
      },
      { threshold: 0.1 }
    );

    observerRef.current = observer;
    observer.observe(loadMoreRef.current);

    return () => observer.disconnect();
  }, [
    isOpen,
    activeTab,
    followersNextCursor,
    followingNextCursor,
    loadMoreFollowers,
    loadMoreFollowing,
  ]);

  const handleFollowToggle = async (targetUserId, isFollowing) => {
    try {
      if (isFollowing) {
        await axios.delete(
          `http://localhost:5000/api/v1/user/${targetUserId}/unfollow`,
          {
            withCredentials: true,
          }
        );
        dispatch(removeFollowing(targetUserId));

        toast.success("Đã hủy theo dõi");
      } else {
        const res = await axios.post(
          `http://localhost:5000/api/v1/user/${targetUserId}/follow`,
          {},
          {
            withCredentials: true,
          }
        );

        toast.success("Đã theo dõi");
      }
      if (activeTab === "followers") {
        loadMoreFollowers();
      } else {
        loadMoreFollowing();
      }
    } catch (error) {
      console.error("Lỗi khi thay đổi trạng thái theo dõi:", error);
      toast.error(
        error.response?.data?.message || "Lỗi khi thay đổi trạng thái theo dõi"
      );
    }
  };

  const handleRemoveFollower = async (targetUserId) => {
    try {
      await axios.delete(
        `http://localhost:5000/api/v1/user/${targetUserId}/follower/remove`,
        {
          withCredentials: true,
        }
      );
      dispatch(removeFollower(targetUserId));
      toast.success("Đã xóa người theo dõi");
      loadMoreFollowers();
    } catch (error) {
      console.error("Lỗi khi xóa người theo dõi:", error);
      toast.error(
        error.response?.data?.message || "Lỗi khi xóa người theo dõi"
      );
    }
  };

  const UserItem = ({ user, isFollowing }) => (
    <div className="flex items-center justify-between p-3 hover:bg-gray-100">
      <div className="flex items-center space-x-3">
        <Link to={`/profile/${user.username}`} onClick={onClose}>
          <img
            src={user.profilePicture || "/default-avatar.png"}
            alt={user.name}
            className="w-10 h-10 rounded-full object-cover"
          />
        </Link>

        <div>
          <Link to={`/profile/${user.username}`} onClick={onClose}>
            <p className="font-semibold">{user.name}</p>
            <p className="text-sm text-gray-500">@{user.username}</p>
          </Link>
        </div>
      </div>
      {currentUser?._id !== user._id && (
        <button
          onClick={() =>
            isCurrentUser && activeTab === "followers"
              ? handleRemoveFollower(user._id)
              : handleFollowToggle(user._id, isFollowing ?? false)
          }
          className={`px-4 py-1 rounded-full text-sm font-medium ${
            isCurrentUser && activeTab === "followers"
              ? "bg-red-100 text-red-700 hover:bg-red-200"
              : isFollowing ?? false
              ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        >
          {isCurrentUser && activeTab === "followers"
            ? "Xóa"
            : isFollowing ?? false
            ? "Hủy theo dõi"
            : "Theo dõi"}
        </button>
      )}
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[90vw] max-w-[500px] h-[80vh] p-0 flex flex-col rounded-lg overflow-hidden border-none">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">
            {isCurrentUser ? "Hồ sơ của bạn" : "Hồ sơ"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex border-b">
          <button
            className={`flex-1 p-4 text-center ${
              activeTab === "followers"
                ? "border-b-2 border-blue-500 font-semibold"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("followers")}
          >
            Người theo dõi
          </button>
          <button
            className={`flex-1 p-4 text-center ${
              activeTab === "following"
                ? "border-b-2 border-blue-500 font-semibold"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("following")}
          >
            Đang theo dõi
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {(followersError || followingError) && (
            <p className="text-red-500 text-center">
              {followersError || followingError}
            </p>
          )}
          {(followersLoading || followingLoading) &&
            !followers.length &&
            !following.length && (
              <p className="text-center text-gray-500">Đang tải...</p>
            )}

          {activeTab === "followers" && (
            <div>
              {followers.length === 0 && !followersLoading && (
                <p className="text-center text-gray-500">
                  Chưa có người theo dõi
                </p>
              )}
              {followers.map((follow) => (
                <UserItem
                  key={follow.follower._id}
                  user={follow.follower}
                  isFollowing={
                    isCurrentUser ? undefined : follow.follower.isFollowing
                  }
                />
              ))}
            </div>
          )}

          {activeTab === "following" && (
            <div>
              {following.length === 0 && !followingLoading && (
                <p className="text-center text-gray-500">Chưa theo dõi ai</p>
              )}
              {following.map((follow) => (
                <UserItem
                  key={follow.following._id}
                  user={follow.following}
                  isFollowing={
                    isCurrentUser ? true : follow.following.isFollowing
                  }
                />
              ))}
            </div>
          )}

          {(activeTab === "followers"
            ? followersNextCursor
            : followingNextCursor) && (
            <div
              ref={loadMoreRef}
              className="h-10 flex items-center justify-center"
            >
              {(followersLoading || followingLoading) && (
                <p className="text-gray-500">Đang tải thêm...</p>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FollowDialog;
