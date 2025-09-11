import { useState, useRef } from "react";
import { toast } from "sonner";
import EditAvatar from "@/components/EditAvatar";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setAuth } from "@/redux/authSlice";

export default function useEditAvatarDialog() {
  const [open, setOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && ["image/jpeg", "image/png"].includes(file.type)) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File không được vượt quá 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result);
        setOpen(true);
      };
      reader.readAsDataURL(file);
    } else {
      toast.error("Vui lòng chọn file JPEG hoặc PNG.");
    }
  };

  const FileInput = (
    <input
      type="file"
      accept="image/jpeg,image/png"
      onChange={handleFileChange}
      ref={fileInputRef}
      className="hidden"
    />
  );

  const triggerFileInput = () => fileInputRef.current?.click();

  const Dialog = (
    <EditAvatar
      open={open}
      onClose={() => setOpen(false)}
      imageSrc={imageSrc}
    />
  );

  return { FileInput, triggerFileInput, Dialog };
}
