import React, { useRef, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "./ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { readFileAsDataURL } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setUserPost } from "@/redux/postSlice";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/contexts/ToastContext";

const CreatePost = ({ open, setOpen }) => {
  const imgRef = useRef();
  const [files, setFiles] = useState([]);
  const [caption, setCaption] = useState("");
  const [imagePreviews, setImagePreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useSelector((store) => store.auth);
  const { posts } = useSelector((store) => store.post);
  const dispatch = useDispatch();
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const { success, error } = useToast();
  const fileChangeHandler = async (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles(selectedFiles);
    const previews = await Promise.all(
      selectedFiles.map((file) => readFileAsDataURL(file))
    );
    setImagePreviews(previews);
  };

  const createPostHandler = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("caption", caption);
    files.forEach((file) => formData.append("image", file));
    try {
      setLoading(true);
      const res = await axios.post(
        "http://localhost:5000/api/v1/post/add",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );
      if (res.data.success) {
        dispatch(setUserPost([res.data.post, ...posts]));
        success('toast.success.postCreated');
        setCaption("");
        setFiles([]);
        setImagePreviews([]);
        setOpen(false);
      }
    } catch (error) {
      error('toast.error.postCreate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent onInteractOutside={() => setOpen(false)} className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
        <DialogTitle className="items-center font-semibold flex justify-center text-slate-900 dark:text-slate-100">
          {t('sidebar.create')} {t('sidebar.post') || 'Post'}
        </DialogTitle>
        <div className="flex gap-3 items-center">
          <Avatar>
            <AvatarImage src={user?.profilePicture} alt="img" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="font-semibold text-xs text-slate-900 dark:text-slate-100">{user?.username}</h1>
            <span className="text-xs text-slate-600 dark:text-slate-300">{user?.bio}</span>
          </div>
        </div>
        <Textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          className="focus-visible:ring-transparent border-none bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-text-slate-500 dark:text-slate-400"
          placeholder="Write a caption..."
        />
        {imagePreviews.length > 0 && (
          <div className="flex flex-wrap gap-2 my-2">
            {imagePreviews.map((src, index) => (
              <div
                key={index}
                className="relative w-32 h-32 rounded-lg overflow-hidden border-slate-200 dark:border-slate-700 border"
              >
                <img
                  src={src}
                  alt={`preview_${index}`}
                  className="w-full h-full object-contain"
                />
              </div>
            ))}
          </div>
        )}
        <input
          ref={imgRef}
          type="file"
          multiple
          className="hidden"
          onChange={fileChangeHandler}
        />
        <Button
          onClick={() => imgRef.current.click()}
          className="w-fit mx-auto text-blue-600-bg hover:text-blue-600-hover"
        >
          Select from computer
        </Button>
        {imagePreviews.length > 0 &&
          (loading ? (
            <Button className="mt-2 text-blue-600-bg hover:text-blue-600-hover">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('common.loading')}
            </Button>
          ) : (
            <Button
              onClick={createPostHandler}
              type="submit"
              className="mt-2 w-full text-blue-600-bg hover:text-blue-600-hover"
            >
              {t('sidebar.post') || 'Post'}
            </Button>
          ))}
      </DialogContent>
    </Dialog>
  );
};

export default CreatePost;
