import { setMessages } from "@/redux/chatSlice";
import axios from "axios";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";

const useGetAllMessage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((store) => store.auth.profile);
  const { selectedConversation } = useSelector(
    (store) => store.chat.selectedConversation
  );
  useEffect(() => {
    const fetchAllMessage = async () => {
      if (!selectedConversation?._id) {
        return;
      }
      try {
        const res = await axios.get(
          `http://localhost:5000/api/v1/message/${selectedConversation._id}/all`,
          {
            withCredentials: true,
          }
        );
        if (res.data.success) {
          dispatch(setMessages(res.data.messages));
        } else {
          toast.error(res.data.error || "Failed to load messages");
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
        toast.error(error.response?.data?.error || "Failed to load messages");
      }
    };
    fetchAllMessage();
  }, [dispatch, selectedConversation, user]);
};

export default useGetAllMessage;
