import { addUserPost, setUserPost } from "@/redux/postSlice";
import axios from "axios";
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";

const useUserPosts = (userId, limit = 5) => {
  const dispatch = useDispatch();
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const fetchUserPosts = async () => {
    if (loading || !hasMore || !userId) return;

    setLoading(true);
    try {
      const params = { limit };
      if (nextCursor) params.lastCreatedAt = nextCursor;

      const res = await axios.get(
        `http://localhost:5000/api/v1/user/${userId}/post`,
        { params, withCredentials: true }
      );

      if (res.data.success) {
        const newPosts = res.data.posts;
        if (newPosts.length === 0) {
          setHasMore(false);
        } else {
          if (!nextCursor) {
            dispatch(setUserPost(newPosts));
          } else {
            dispatch(addUserPost(newPosts));
          }
          setNextCursor(res.data.nextCursor || null);
        }
      }
    } catch (err) {
      console.error("Error fetching posts:", err);
    } finally {
      setLoading(false);
    }
  };

  const resetPosts = () => {
    setNextCursor(null);
    setHasMore(true);
    dispatch(setUserPost([]));
  };

  return { fetchUserPosts, resetPosts, hasMore, loading };
};

export default useUserPosts;
