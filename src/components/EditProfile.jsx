import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { setAuth } from "@/redux/authSlice";
import AvatarMenu from "./AvatarMenu";
import { Link } from "react-router-dom";

const EditProfile = () => {
  const { user } = useSelector((store) => store.auth);
  const dispatch = useDispatch();

  const [input, setInput] = useState({
    name: user?.name || "",
    bio: user?.bio || "",
    gender: user?.gender || "",
  });
  const [loading, setLoading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const handleInputChange = (field, value) => {
    setInput((prev) => {
      const newInput = { ...prev, [field]: value };
      setIsDirty(
        newInput.name !== user?.name ||
          newInput.bio !== user?.bio ||
          newInput.gender !== user?.gender
      );
      return newInput;
    });
  };

  const editProfileHandler = async () => {
    try {
      setLoading(true);
      const res = await axios.post(
        "http://localhost:5000/api/v1/user/profile/edit",
        input,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      if (res.data.success) {
        dispatch(setAuth(res.data.user));
        toast.success(res.data.message);
        setInput({
          name: res.data.user.name,
          bio: res.data.user.bio,
          gender: res.data.user.gender,
        });
        setIsDirty(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Cập nhật thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex max-w-2xl mt-4 mx-auto pl-10">
      <section className="flex flex-col gap-6 w-full">
        <h1 className="font-bold text-xl">Edit Profile</h1>

        {/* Avatar */}
        <div className="flex items-center justify-between bg-gray-100 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12">
              <AvatarImage
                src={user?.profilePicture}
                alt="user_profilePicture"
              />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="font-bold text-sm">{user?.username}</h1>
              <span className="text-gray-600 text-sm">
                {user?.name || "Name here..."}
              </span>
            </div>
          </div>

          <AvatarMenu>
            <Button className="bg-[#0095F6] h-8 hover:bg-[#318bc7]">
              Change
            </Button>
          </AvatarMenu>
        </div>

        {/* Name */}
        <div>
          <h1 className="font-bold text-xl mb-2">Name</h1>
          <Textarea
            value={input.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            className="focus-visible:ring-transparent"
          />
        </div>

        {/* Bio */}
        <div>
          <h1 className="font-bold text-xl mb-2">Bio</h1>
          <Textarea
            value={input.bio}
            onChange={(e) => handleInputChange("bio", e.target.value)}
            className="focus-visible:ring-transparent"
          />
        </div>

        {/* Gender */}
        <div>
          <h1 className="font-bold text-xl mb-2">Gender</h1>
          <Select
            value={input.gender}
            onValueChange={(v) => handleInputChange("gender", v)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Submit button */}
        <div className="flex justify-between">
          <Link to={`/profile/${user.username}`}>
            <Button className="w-fit bg-[#0095F6] hover:bg-[#2a8ccd] disabled:opacity-50">
              Back
            </Button>
          </Link>
          <Button
            onClick={editProfileHandler}
            disabled={!isDirty || loading}
            className="w-fit bg-[#0095F6] hover:bg-[#2a8ccd] disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="animate-spin mr-2 h-4 w-4" />
            ) : (
              "Submit"
            )}
          </Button>
        </div>
      </section>
    </div>
  );
};

export default EditProfile;
