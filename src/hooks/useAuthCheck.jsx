import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { resetAuth, setAuthUser, startAuthCheck } from "../redux/authSlice";
import axios from "axios";

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
      }
    };
    checkAuth();
  }, [dispatch]);
};

export default useAuthCheck;
