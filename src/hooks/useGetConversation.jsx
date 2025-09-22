import axios from "axios";
import { useDispatch } from "react-redux";

const useGetConversation = () => {
  const dispatch = useDispatch();
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const fetchBookmarks = async () => {
    if (loading || !hasMore) return;
    setLoading(true);

    try {
      const res = await axios.get(
        "http://localhost:5000/api/v1/conversation/all",
        {
          params: {
            limit,
            lastCreatedAt: nextCursor,
          },
          withCredentials: true,
        }
      );

      if (res.data.success) {
        const newConversations = res.data.conversations || [];

        if (newConversations.length === 0) {
          setHasMore(false);
        } else {
          if (!nextCursor) {
            dispatch(setConver(nnewConversations));
          } else {
            dispatch(addBookmarks(newConversations));
          }
          setNextCursor(res.data.nextCursor);
          if (newBookmarks.length < limit) {
            setHasMore(false);
          }
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

export default useGetConversation;
