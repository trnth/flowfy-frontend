import { useEffect } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";
import { setVerified, setUnverified, setLoading } from "@/redux/authSlice";

const useVerified = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const verify = async () => {
      dispatch(setLoading(true));
      try {
        const res = await axios.get(`/auth/verified`);
        if (res.data.user) {
          dispatch(setVerified(res.data.user));
        }
      } catch (err) {
        console.log(err);
        dispatch(setUnverified());
      }
    };
    verify();
  }, [dispatch]);
};

export default useVerified;
