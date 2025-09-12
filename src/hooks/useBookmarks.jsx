import { useState } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";
import { addBookmarks, setBookmarks } from "@/redux/postSlice";

const useBookmarks = (limit = 10) => {
  const dispatch = useDispatch();
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const fetchBookmarks = async () => {
    if (loading || !hasMore) return;
    setLoading(true);

    try {
      const res = await axios.get(
        "http://localhost:5000/api/v1/user/bookmarks",
        {
          params: {
            limit,
            lastCreatedAt: nextCursor,
          },
          withCredentials: true,
        }
      );

      if (res.data.success) {
        const newBookmarks = res.data.bookmarks || [];

        if (newBookmarks.length === 0) {
          setHasMore(false);
        } else {
          if (!nextCursor) {
            dispatch(setBookmarks(newBookmarks));
          } else {
            dispatch(addBookmarks(newBookmarks));
          }
          setNextCursor(res.data.nextCursor);
        }
      }
    } catch (err) {
      console.error("Error fetching bookmarks:", err);
    } finally {
      setLoading(false);
    }
  };

  const resetBookmarks = () => {
    setNextCursor(null);
    setHasMore(true);
    dispatch(setBookmarks([]));
  };

  return { fetchBookmarks, hasMore, loading, resetBookmarks };
};

export default useBookmarks;
