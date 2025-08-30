import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { resetAuth, setAuthUser, startAuthCheck } from "../redux/authSlice";
import axios from "axios";
import { resetPosts } from "@/redux/postSlice";
import { resetSocket } from "@/redux/socketSlice";
import { resetChat } from "@/redux/chatSlice";
import { resetNotification } from "@/redux/notificationSlice";

const useAuthCheck = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    const checkAuth = async () => {
      try {
        dispatch(startAuthCheck());
        const res = await axios.get("http://localhost:5000/api/v1/auth/me", {
          withCredentials: true,
        });
        dispatch(setAuthUser(res.data.user));
      } catch (err) {
        dispatch(resetAuth());
        dispatch(resetPosts());
        dispatch(resetSocket());
        dispatch(resetChat());
        dispatch(resetNotification());
      }
    };
    checkAuth();
  }, [dispatch]);
};

export default useAuthCheck;
