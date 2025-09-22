import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";
import { setIsCurrentUser, setUserProfile } from "@/redux/userSlice";

const useUserProfile = (userId) => {
  const dispatch = useDispatch();
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
          dispatch(setUserProfile(res.data.user));
          if (res.data.isCurrentUser) {
            dispatch(setIsCurrentUser(true));
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchGetUserProfile();
  }, [userId, dispatch]);
  return loading;
};

export default useUserProfile;
