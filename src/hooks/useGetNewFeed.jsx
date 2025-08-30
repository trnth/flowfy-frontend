import { setPosts } from "@/redux/postSlice";
import axios from "axios";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

import React from "react";

const useGetNewFeed = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    const fetchNewFeed = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/v1/post/newfeeds",
          {
            withCredentials: true,
          }
        );
        if (res.data.success) {
          console.log(res.data.posts);
          dispatch(setPosts(res.data.posts));
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchNewFeed();
  }, []);
};

export default useGetNewFeed;
