import React, { useEffect, useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { markAsRead, markAllAsRead } from "@/redux/notificationSlice";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Heart,
  MessageCircle,
  UserPlus,
  CheckCircle,
  MoreHorizontal,
  Bell,
  BellOff,
  Settings,
  Check,
  X,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/contexts/ToastContext";

const NotificationDialog = ({ open, setOpen }) => {
  const { notifications } = useSelector((store) => store.notification);
  const [serverNotifications, setServerNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [processingRequests, setProcessingRequests] = useState(new Set());
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const { success, error } = useToast();

  // Debug: Log translation function
  console.log("NotificationDialog - t function:", t);
  console.log(
    "NotificationDialog - followRequest.accept:",
    t("followRequest.accept")
  );
  console.log(
    "NotificationDialog - followRequest.decline:",
    t("followRequest.decline")
  );

  const fetchNotifications = async (reset = false) => {
    try {
      setLoading(true);
      const res = await axios.get(
        `http://localhost:5000/api/v1/notification/all`,
        {
          params: {
            limit: 20,
            lastId: reset ? undefined : cursor,
          },
          withCredentials: true,
        }
      );

      if (res.data?.success) {
        const newNotifications = res.data.notifications || [];
        setServerNotifications((prev) =>
          reset ? newNotifications : [...prev, ...newNotifications]
        );
        setCursor(res.data.nextCursor);
        setHasMore(newNotifications.length === 20);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchNotifications(true);
    }
  }, [open]);

  const handleMarkAllAsRead = async () => {
    try {
      await axios.post(
        `http://localhost:5000/api/v1/notification/read/all`,
        {},
        { withCredentials: true }
      );
      setServerNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true }))
      );
      dispatch(markAllAsRead());
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await axios.post(
        `http://localhost:5000/api/v1/notification/${id}/read`,
        {},
        { withCredentials: true }
      );
      setServerNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      dispatch(markAsRead(id));
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  const handleAcceptFollowRequest = async (notificationId, requesterId) => {
    try {
      setProcessingRequests((prev) => new Set(prev).add(notificationId));

      const res = await axios.post(
        `http://localhost:5000/api/v1/user/${requesterId}/follow/accept`,
        {},
        { withCredentials: true }
      );

      if (res.data.success) {
        // Remove the notification from the list
        setServerNotifications((prev) =>
          prev.filter((n) => n._id !== notificationId)
        );

        // Show success message
        success(t("followRequest.accepted"));
      }
    } catch (err) {
      console.error(t("followRequest.acceptError"), err);
      error(t("followRequest.acceptError"));
    } finally {
      setProcessingRequests((prev) => {
        const newSet = new Set(prev);
        newSet.delete(notificationId);
        return newSet;
      });
    }
  };

  const handleDeclineFollowRequest = async (notificationId, requesterId) => {
    try {
      setProcessingRequests((prev) => new Set(prev).add(notificationId));

      const res = await axios.post(
        `http://localhost:5000/api/v1/user/${requesterId}/follow/decline`,
        {},
        { withCredentials: true }
      );

      if (res.data.success) {
        // Remove the notification from the list
        setServerNotifications((prev) =>
          prev.filter((n) => n._id !== notificationId)
        );

        // Show success message
        success(t("followRequest.declined"));
      }
    } catch (err) {
      console.error(t("followRequest.declineError"), err);
      error(t("followRequest.declineError"));
    } finally {
      setProcessingRequests((prev) => {
        const newSet = new Set(prev);
        newSet.delete(notificationId);
        return newSet;
      });
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "like":
        return <Heart className="w-4 h-4 text-red-500" />;
      case "comment":
        return <MessageCircle className="w-4 h-4 text-blue-500" />;
      case "comment_like":
        return <Heart className="w-4 h-4 text-pink-500" />;
      case "follow":
        return <UserPlus className="w-4 h-4 text-green-500" />;
      case "request":
        return <UserPlus className="w-4 h-4 text-orange-500" />;
      case "accepted":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const getNotificationText = (notification) => {
    const username =
      notification.senderId?.username || notification.userDetail?.username;

    switch (notification.type) {
      case "like":
        return t("notification.likedPost").replace("{user}", username);
      case "comment":
        return t("notification.commentedPost").replace("{user}", username);
      case "comment_like":
        return t("notification.likedComment").replace("{user}", username);
      case "follow":
        return t("notification.followedYou").replace("{user}", username);
      case "request":
        return t("notification.sentFollowRequest").replace("{user}", username);
      case "accepted":
        return t("notification.acceptedFollow").replace("{user}", username);
      default:
        return t("notification.interacted").replace("{user}", username);
    }
  };

  const handleNotificationClick = (notification) => {
    if (notification && !notification.isRead) {
      handleMarkAsRead(notification._id);
    }

    // Close dialog first
    setOpen(false);

    // Navigate based on notification type
    if (
      notification.type === "like" ||
      notification.type === "comment" ||
      notification.type === "comment_like"
    ) {
      // For post-related notifications, we need to open the post in CommentDialog
      const postId = notification.post?._id || notification.post;
      if (postId) {
        // Dispatch action to set selected post and open comment dialog
        // This will be handled by the parent component
        window.dispatchEvent(
          new CustomEvent("openPostComments", {
            detail: { postId },
          })
        );
      }
    } else if (
      notification.type === "follow" ||
      notification.type === "request" ||
      notification.type === "accepted"
    ) {
      // Navigate to user profile
      navigate(
        `/profile/${notification.senderId?._id || notification.senderId}`
      );
    }
  };

  const allNotifications = [...notifications, ...serverNotifications];
  const unreadCount = allNotifications.filter((n) => n && !n.isRead).length;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md w-full max-h-[80vh] p-0 sm:max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
        <DialogHeader className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
              <Bell className="w-5 h-5" />
              {t("sidebar.notifications")}
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </DialogTitle>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:bg-slate-800"
                >
                  Đánh dấu tất cả đã đọc
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:bg-slate-800"
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6">
          {allNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <BellOff className="w-12 h-12 text-slate-500 dark:text-slate-400 mb-4" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                Không có thông báo
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 max-w-xs">
                Bạn sẽ nhận được thông báo khi có người tương tác với nội dung
                của bạn
              </p>
            </div>
          ) : (
            <div className="py-4 space-y-1">
              {allNotifications.map((notification, index) => (
                <div key={notification._id || notification.userId || index}>
                  <div
                    className={`group flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors hover:theme-bg-secondary ${
                      notification && !notification.isRead
                        ? "theme-bg-tertiary border-l-4 border-blue-500"
                        : ""
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="relative">
                      <Avatar className="w-10 h-10">
                        <AvatarImage
                          src={
                            notification.senderId?.profilePicture ||
                            notification.userDetail?.profilePicture
                          }
                        />
                        <AvatarFallback>
                          {(
                            notification.senderId?.username ||
                            notification.userDetail?.username ||
                            "U"
                          )
                            .charAt(0)
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 bg-white dark:bg-slate-900 rounded-full p-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-900 dark:text-slate-100 leading-relaxed">
                        {getNotificationText(notification)}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {formatDistanceToNow(
                            new Date(notification.createdAt),
                            {
                              addSuffix: true,
                              locale: vi,
                            }
                          )}
                        </p>
                        {notification && !notification.isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                    </div>

                    {/* Follow request actions */}
                    {notification.type === "request" && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-green-600 border-green-600 hover:bg-green-50 dark:text-green-400 dark:border-green-400 dark:hover:bg-green-900/20"
                          onClick={(e) => {
                            e.stopPropagation();
                            const requesterId =
                              notification.senderId?._id ||
                              notification.senderId;
                            handleAcceptFollowRequest(
                              notification._id,
                              requesterId
                            );
                          }}
                          disabled={processingRequests.has(notification._id)}
                        >
                          <Check className="w-3 h-3 mr-1" />
                          {processingRequests.has(notification._id)
                            ? t("followRequest.accepting")
                            : t("followRequest.accept")}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-600 hover:bg-red-50 dark:text-red-400 dark:border-red-400 dark:hover:bg-red-900/20"
                          onClick={(e) => {
                            e.stopPropagation();
                            const requesterId =
                              notification.senderId?._id ||
                              notification.senderId;
                            handleDeclineFollowRequest(
                              notification._id,
                              requesterId
                            );
                          }}
                          disabled={processingRequests.has(notification._id)}
                        >
                          <X className="w-3 h-3 mr-1" />
                          {processingRequests.has(notification._id)
                            ? t("followRequest.declining")
                            : t("followRequest.decline")}
                        </Button>
                      </div>
                    )}

                    {/* Default mark as read button for other notifications */}
                    {notification &&
                      notification.type !== "request" &&
                      !notification.isRead && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:bg-slate-800"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsRead(notification._id);
                          }}
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      )}
                  </div>
                  {index < allNotifications.length - 1 && (
                    <Separator className="my-1 border-slate-200 dark:border-slate-700" />
                  )}
                </div>
              ))}

              {hasMore && (
                <div className="flex justify-center py-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchNotifications(false)}
                    disabled={loading}
                    className="border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:bg-slate-800"
                  >
                    {loading ? t("common.loading") : t("notification.loadMore")}
                  </Button>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationDialog;
