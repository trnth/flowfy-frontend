import { setAuth, setVerified } from "@/redux/authSlice";
import axios from "axios";
import { useDispatch } from "react-redux";
import { useEffect } from "react";

const useVerified = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const verifyUser = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/v1/auth/verified",
          {
            withCredentials: true,
          }
        );
        if (res.data.success) {
          dispatch(setAuth(res.data.user));
          dispatch(setVerified(true));
        } else {
          dispatch(setVerified(false));
        }
      } catch (error) {
        dispatch(setVerified(false));
      }
    };

    verifyUser();
  }, [dispatch]);
};

export default useVerified;
