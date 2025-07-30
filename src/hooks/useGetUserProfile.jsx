import { setUserProfile } from "@/redux/authSlice";
import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";

const useGetUserProfile = (userId) => {
  const dispatch = useDispatch();
  //const [userProfile, setUserProfile] = useState(null);
  useEffect(() => {
    const fetchGetUserProfile = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/v1/user/profile/${userId}`,
          { withCredentials: true }
        );
        if (res.data.success) {
          dispatch(setUserProfile(res.data.user));
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchGetUserProfile();
  }, [userId]);
};

export default useGetUserProfile;
