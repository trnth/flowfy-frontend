import React, { useState, useRef, useCallback, useEffect } from "react";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { toast } from "sonner";
import { setAuth } from "@/redux/authSlice";

export default function EditAvatar({ open, onClose, imageSrc }) {
  const dispatch = useDispatch();
  const { user } = useSelector((store) => store.auth);

  const [crop, setCrop] = useState(null);
  const [completedCrop, setCompletedCrop] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [croppedBlob, setCroppedBlob] = useState(null);
  const [loading, setLoading] = useState(false);
  const imgRef = useRef(null);

  // Khởi tạo crop mặc định
  const onImageLoad = useCallback((e) => {
    if (!e.currentTarget) return;
    const { width, height } = e.currentTarget;
    const size = Math.min(width, height) * 0.8;
    const newCrop = {
      unit: "px",
      width: size,
      height: size,
      x: (width - size) / 2,
      y: (height - size) / 2,
      aspect: 1,
    };
    setCrop(newCrop);
    setCompletedCrop(newCrop);
  }, []);

  // Tạo preview và blob
  const generateCroppedImage = useCallback(() => {
    if (!completedCrop || !imgRef.current || !completedCrop.width) {
      toast.error("Vui lòng chọn vùng cắt hợp lệ.");
      return null;
    }

    const image = imgRef.current;
    const canvas = document.createElement("canvas");
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    const cropX = completedCrop.x * scaleX;
    const cropY = completedCrop.y * scaleY;
    const cropW = completedCrop.width * scaleX;
    const cropH = completedCrop.height * scaleY;

    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      toast.error("Không thể xử lý ảnh.");
      return null;
    }

    ctx.drawImage(image, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          setPreviewUrl((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return url;
          });
          setCroppedBlob(blob);
        } else {
          toast.error("Không thể tạo ảnh cắt.");
        }
      },
      "image/jpeg",
      0.9
    );
  }, [completedCrop]);

  // Lưu avatar
  const handleSave = useCallback(async () => {
    if (!croppedBlob) {
      toast.error("Chưa có ảnh preview để lưu.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("profilePicture", croppedBlob, "avatar.jpg");

    try {
      const res = await axios.post(
        "http://localhost:5000/api/v1/user/profile/edit/profilePicture",
        formData,
        { withCredentials: true }
      );
      if (res.data.success) {
        dispatch(setAuth(res.data.user));
        toast.success("Update avatar successfully");
        onClose();
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Update avatar failed";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [croppedBlob, dispatch, onClose]);

  useEffect(() => {
    if (!open) {
      setCrop(null);
      setCompletedCrop(null);
      setCroppedBlob(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
    }
  }, [open, previewUrl]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className={`max-w-md sm:max-w-lg flex flex-col transition-all duration-300
    ${previewUrl ? "h-[400px]" : "h-[80vh]"}`}
      >
        <DialogHeader className="shrink-0">
          <DialogTitle>
            {previewUrl ? "Xem trước Avatar" : "Chỉnh sửa Avatar"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto p-2 flex justify-center items-center">
          {!previewUrl && imageSrc && (
            <ReactCrop
              crop={crop}
              onChange={(c) => setCrop(c)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={1}
              circularCrop
            >
              <img
                ref={imgRef}
                src={imageSrc}
                alt="Ảnh cần cắt"
                onLoad={onImageLoad}
                className="block max-w-none"
              />
            </ReactCrop>
          )}

          {previewUrl && (
            <div className="flex flex-col items-center gap-2">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
              />
              <p className="text-sm text-gray-600">
                Preview (sẽ hiển thị như hình tròn)
              </p>
            </div>
          )}
        </div>

        {/* Footer (buttons) */}
        <div className="shrink-0 mt-4 flex justify-center gap-2 border-t pt-3">
          {!previewUrl ? (
            <>
              <Button variant="secondary" onClick={onClose}>
                Hủy
              </Button>
              {imageSrc && (
                <Button
                  onClick={generateCroppedImage}
                  disabled={!completedCrop || !completedCrop.width}
                >
                  Xem Preview
                </Button>
              )}
            </>
          ) : (
            <>
              <Button
                variant="secondary"
                onClick={() => {
                  if (previewUrl) URL.revokeObjectURL(previewUrl);
                  setPreviewUrl(null);
                  setCroppedBlob(null);
                }}
              >
                Chỉnh lại
              </Button>
              <Button onClick={handleSave} disabled={loading}>
                {loading ? "Đang lưu..." : "Lưu"}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
