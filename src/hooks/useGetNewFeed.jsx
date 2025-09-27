import { setPosts } from "@/redux/postSlice";
import axios from "axios";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

const useGetNewFeed = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    const fetchNewFeed = async () => {
      try {
        const res = await axios.get(`/post/newfeeds`);
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
