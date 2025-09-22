import {
  addUserPost,
  setUserPost,
  setUserPostNextCursor,
} from "@/redux/postSlice";
import axios from "axios";
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";

const useUserPosts = (userId, limit = 5) => {
  const dispatch = useDispatch();
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const fetchUserPosts = async (cursor = null) => {
    if (loading || !hasMore || !userId) return;

    setLoading(true);
    try {
      const params = { limit };
      if (cursor) params.lastCreatedAt = cursor;

      const res = await axios.get(
        `http://localhost:5000/api/v1/user/${userId}/post`,
        { params, withCredentials: true }
      );

      if (res.data.success) {
        const newPosts = res.data.posts;
        if (newPosts.length === 0) {
          setHasMore(false);
        } else {
          if (!cursor) {
            dispatch(setUserPost(newPosts));
          } else {
            dispatch(addUserPost(newPosts));
          }
          dispatch(setUserPostNextCursor(res.data.nextCursor || null));
          if (newPosts.length < limit) {
            setHasMore(false);
          }
        }
      }
    } catch (err) {
      console.error("Error fetching posts:", err);
    } finally {
      setLoading(false);
    }
  };

  const resetPosts = () => {
    setHasMore(true);
    dispatch(setUserPost([]));
    dispatch(setUserPostNextCursor(null));
  };

  return { fetchUserPosts, resetPosts, hasMore, loading };
};

export default useUserPosts;
