import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { resetAuth, setAuthUser } from "../redux/authSlice";
import axios from "axios";
import store from "@/redux/store";

const useAuthCheck = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((store) => store.auth);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/v1/auth/me", {
          withCredentials: true,
        });
        dispatch(setAuthUser(res.data.user));
      } catch (err) {
        dispatch(resetAuth());
      }
    };
    checkAuth();
  }, [dispatch]);

  return user;
};

export default useAuthCheck;
