import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";
import { setUserProfile } from "@/redux/userSlice";
import { setAuth } from "@/redux/authSlice";

const useUserProfile = (userId) => {
  const dispatch = useDispatch();
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGetUserProfile = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `http://localhost:5000/api/v1/user/${userId}/profile`,
          { withCredentials: true }
        );

        if (res.data.success) {
          if (res.data.isCurrentUser) {
            dispatch(setAuth(res.data.resUser));
            setIsCurrentUser(true);
          } else {
            dispatch(setUserProfile(res.data.resUser));
            setIsCurrentUser(false);
          }
        }
      } catch (error) {
        console.error(error);
        setIsCurrentUser(false);
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchGetUserProfile();
  }, [userId, dispatch]);

  return { isCurrentUser, loading };
};

export default useUserProfile;
