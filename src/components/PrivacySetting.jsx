import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "./ui/button";
import axios from "axios";
import { toast } from "sonner";
import { useSelector, useDispatch } from "react-redux";
import { setAuth } from "@/redux/authSlice";

const PrivacySetting = () => {
  const { user } = useSelector((store) => store.auth);
  const dispatch = useDispatch();

  const [privacy, setPrivacy] = useState(user?.privacy || "public");
  const [loading, setLoading] = useState(false);

  const isDirty = privacy !== user?.privacy;

  const updatePrivacy = async () => {
    try {
      setLoading(true);
      const res = await axios.post(
        "http://localhost:5000/api/v1/user/profile/privacy",
        { privacy },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      if (res.data.success) {
        dispatch(setAuth(res.data.user));
        toast.success(res.data.message || "Privacy updated");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4 mx-auto pl-10">
      <h1 className="font-bold text-xl mb-4">Privacy Settings</h1>
      <Select value={privacy} onValueChange={setPrivacy}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select privacy" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="public">Public</SelectItem>
          <SelectItem value="private">Private</SelectItem>
        </SelectContent>
      </Select>

      <div className="shrink-0 mt-4 flex justify-end gap-2 border-t pt-3">
        <Button
          className="mt-4 bg-blue-500 hover:bg-blue-600 disabled:opacity-50"
          disabled={!isDirty || loading}
          onClick={updatePrivacy}
        >
          {loading ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  );
};

export default PrivacySetting;
