import { useCallback, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import {
  setFollowers,
  addFollowers,
  resetFollowers,
  setFollowing,
  addFollowing,
  resetFollowing,
  setLoading,
  setError,
} from "../redux/followSlice";

// Hook để lấy danh sách người theo dõi (followers)
export const useFollowers = (userId, requestingUserId) => {
  const dispatch = useDispatch();
  const { followers, nextCursor, loading, error } = useSelector((state) => ({
    followers: state.follow.followers,
    nextCursor: state.follow.followersNextCursor,
    loading: state.follow.loading,
    error: state.follow.error,
  }));

  // Hàm lấy danh sách followers
  const fetchFollowers = useCallback(
    async (lastCreatedAt, limit = 20) => {
      try {
        dispatch(setLoading(true));
        dispatch(setError(null));

        const response = await axios.get(
          `http://localhost:5000/api/v1/user/${userId}/followers`,
          {
            params: { lastCreatedAt, limit },
            withCredentials: true,
          }
        );

        if (!response.data.success) {
          throw new Error(response.data.message);
        }

        const payload = {
          followers: response.data.followers,
          nextCursor: response.data.nextCursor,
        };
        if (lastCreatedAt) {
          dispatch(addFollowers(payload));
        } else {
          dispatch(setFollowers(payload));
        }
      } catch (err) {
        dispatch(
          setError(err.message || "Lỗi khi lấy danh sách người theo dõi")
        );
      } finally {
        dispatch(setLoading(false));
      }
    },
    [userId, dispatch]
  );

  // Hàm làm mới danh sách
  const refresh = useCallback(() => {
    dispatch(resetFollowers());
    fetchFollowers(null);
  }, [fetchFollowers, dispatch]);

  // Hàm tải thêm
  const loadMore = useCallback(() => {
    if (nextCursor && !loading) {
      fetchFollowers(nextCursor);
    }
  }, [nextCursor, loading, fetchFollowers]);

  // Lấy dữ liệu ban đầu khi userId thay đổi
  useEffect(() => {
    if (userId) {
      refresh();
    }
  }, [userId, refresh]);

  return {
    followers,
    nextCursor,
    loading,
    error,
    loadMore,
    refresh,
    isCurrentUser: requestingUserId && requestingUserId === userId,
  };
};

// Hook để lấy danh sách người đang theo dõi (following)
export const useFollowing = (userId, requestingUserId) => {
  const dispatch = useDispatch();
  const { following, nextCursor, loading, error } = useSelector((state) => ({
    following: state.follow.following,
    nextCursor: state.follow.followingNextCursor,
    loading: state.follow.loading,
    error: state.follow.error,
  }));

  // Hàm lấy danh sách following
  const fetchFollowing = useCallback(
    async (lastCreatedAt, limit = 20) => {
      try {
        dispatch(setLoading(true));
        dispatch(setError(null));

        const response = await axios.get(
          `http://localhost:5000/api/v1/user/${userId}/followings`,
          {
            params: { lastCreatedAt, limit },
            withCredentials: true,
          }
        );

        if (!response.data.success) {
          throw new Error(response.data.message);
        }

        const payload = {
          following: response.data.following,
          nextCursor: response.data.nextCursor,
        };
        if (lastCreatedAt) {
          dispatch(addFollowing(payload));
        } else {
          dispatch(setFollowing(payload));
        }
      } catch (err) {
        dispatch(
          setError(err.message || "Lỗi khi lấy danh sách đang theo dõi")
        );
      } finally {
        dispatch(setLoading(false));
      }
    },
    [userId, dispatch]
  );

  // Hàm làm mới danh sách
  const refresh = useCallback(() => {
    dispatch(resetFollowing());
    fetchFollowing(null);
  }, [fetchFollowing, dispatch]);

  // Hàm tải thêm
  const loadMore = useCallback(() => {
    if (nextCursor && !loading) {
      fetchFollowing(nextCursor);
    }
  }, [nextCursor, loading, fetchFollowing]);

  // Lấy dữ liệu ban đầu khi userId thay đổi
  useEffect(() => {
    if (userId) {
      refresh();
    }
  }, [userId, refresh]);

  return {
    following,
    nextCursor,
    loading,
    error,
    loadMore,
    refresh,
    isCurrentUser: requestingUserId && requestingUserId === userId,
  };
};
