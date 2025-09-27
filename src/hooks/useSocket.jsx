import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useSelector, useDispatch } from "react-redux";
import { setSocketStatus } from "@/redux/socketSlice";
import { setNotification } from "@/redux/notificationSlice";
import { setOnlineUsers } from "@/redux/userSlice";
import { updatePost, addCommentToPost } from "@/redux/postSlice";
import { removeFollower, removeFollowing } from "@/redux/followSlice";

const useSocket = () => {
  const { profile: user, isVerified } = useSelector((store) => store.auth);
  const dispatch = useDispatch();
  const socketRef = useRef(null);

  useEffect(() => {
    if (!isVerified || !user?._id) return;
    if (socketRef.current) return; // singleton

    const url = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";
    console.log("[socket] init connect", { url, userId: user._id });
    const socket = io(url, {
      query: { userId: user._id },
      withCredentials: true,
      transports: ["websocket"],
    });

    socketRef.current = socket;
    dispatch(setSocketStatus(true));

    socket.on("connect", () => console.log("[socket] client connected:", socket.id));
    socket.on("connect_error", (err) => console.log("[socket] connect_error", err?.message));
    socket.on("reconnect", (attempt) => console.log("[socket] reconnect", attempt));
    socket.on("reconnect_attempt", (attempt) => console.log("[socket] reconnect_attempt", attempt));
    socket.on("reconnect_error", (err) => console.log("[socket] reconnect_error", err?.message));
    socket.on("reconnect_failed", () => console.log("[socket] reconnect_failed"));
    socket.on("disconnect", () => {
      console.log("[socket] client disconnected");
      dispatch(setSocketStatus(false));
    });

    let lastOnlineUsers = [];
    socket.on("getOnlineUsers", (onlineUsers) => {
      if (
        onlineUsers?.length !== lastOnlineUsers.length ||
        !onlineUsers?.every((id, i) => id === lastOnlineUsers[i])
      ) {
        console.log("[socket] getOnlineUsers", onlineUsers);
        dispatch(setOnlineUsers(onlineUsers));
        lastOnlineUsers = onlineUsers;
      }
    });

    socket.on("notification", (notification) => {
      console.log("[socket] notification", notification);
      dispatch(setNotification(notification));
    });

    // Real-time post updates
    socket.on("postUpdated", (data) => {
      console.log("[socket] postUpdated", data);
      if (data.postId && data.updates) {
        dispatch(updatePost({ postId: data.postId, updates: data.updates }));
      }
    });

    // Real-time comment updates
    socket.on("commentAdded", (data) => {
      console.log("[socket] commentAdded", data);
      if (data.postId) {
        dispatch(addCommentToPost({ postId: data.postId, comment: data.comment }));
        
        // Dispatch custom event for CommentDialog
        window.dispatchEvent(new CustomEvent('commentAdded', { 
          detail: { postId: data.postId, comment: data.comment } 
        }));
      }
    });

    // Real-time follow updates
    socket.on("followUpdated", (data) => {
      console.log("[socket] followUpdated", data);
      if (data.action === "unfollow" && data.userId) {
        dispatch(removeFollower(data.userId));
        dispatch(removeFollowing(data.userId));
      }
    });
    return () => {
      console.log("[socket] cleanup disconnect");
      socket.disconnect();
      dispatch(setSocketStatus(false));
      socketRef.current = null;
    };
  }, [isVerified, user?._id, dispatch]);

  return socketRef.current;
};

export default useSocket;
