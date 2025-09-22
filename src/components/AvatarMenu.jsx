import React, { useState } from "react";
import { toast } from "sonner";
import useEditAvatarDialog from "@/hooks/useEditAvatarDialog";
import axios from "axios";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { Ghost, User } from "lucide-react";
import { useDispatch } from "react-redux";
import { setUserProfile } from "@/redux/userSlice";
import { setProfile } from "@/redux/authSlice";

export default function AvatarMenu({ children }) {
  const {
    FileInput,
    triggerFileInput,
    Dialog: AvatarDialog,
  } = useEditAvatarDialog();
  const dispatch = useDispatch();
  const [menuOpen, setMenuOpen] = useState(false);
  const handleRemoveAvatar = async () => {
    try {
      const res = await axios.delete(
        "http://localhost:5000/api/v1/user/profile/edit/profilePicture/delete",
        { withCredentials: true }
      );
      if (res.data.success) {
        dispatch(setUserProfile(res.data.user));
        dispatch(setProfile(res.data.user));
        toast.success("Đã gỡ avatar");
      } else toast.error("Gỡ avatar thất bại");
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi gỡ avatar");
    } finally {
      setMenuOpen(false);
    }
  };

  return (
    <div className="inline-block relative">
      <Dialog open={menuOpen} onOpenChange={setMenuOpen}>
        <DialogTrigger asChild>
          <div className="cursor-pointer">{children}</div>
        </DialogTrigger>

        <DialogContent className="flex flex-col items-center text-sm text-center">
          <Button
            variant={Ghost}
            className="cursor-pointer w-fit font-bold"
            onClick={() => {
              triggerFileInput();
              setMenuOpen(false);
            }}
          >
            Thay đổi ảnh
          </Button>
          <Button
            variant={Ghost}
            className="cursor-pointer w-fit text-[#ED4956] font-bold"
            onClick={handleRemoveAvatar}
          >
            Gỡ ảnh
          </Button>
        </DialogContent>
      </Dialog>

      {/* Ẩn input file và dialog edit avatar */}
      {FileInput}
      {AvatarDialog}
    </div>
  );
}
