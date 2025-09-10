import { setUserProfile } from "@/redux/userSlice";
import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

const useUserProfile = (userId) => {
  const dispatch = useDispatch();
  useEffect(() => {
    const fetchGetUserProfile = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/v1/user/${userId}/profile`,
          {
            withCredentials: true,
          }
        );

        if (res.data.success) {
          dispatch(setUserProfile(res.data.resUser));
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchGetUserProfile();
  }, [userId]);
};

export default useUserProfile;
