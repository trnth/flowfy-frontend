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
import AvatarMenu from "./AvatarMenu";
import { Link } from "react-router-dom";
import { setProfile } from "@/redux/authSlice";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/contexts/ToastContext";
import { getCommonClasses } from "@/utils/themeUtils";

const EditProfile = () => {
  const { profile } = useSelector((store) => store.auth);
  const dispatch = useDispatch();
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const { success, error } = useToast();
  const classes = getCommonClasses(isDark);

  const [input, setInput] = useState({
    name: profile?.name || "",
    bio: profile?.bio || "",
    gender: profile?.gender || "",
  });
  const [loading, setLoading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const handleInputChange = (field, value) => {
    setInput((prev) => {
      const newInput = { ...prev, [field]: value };
      setIsDirty(
        newInput.name !== profile?.name ||
          newInput.bio !== profile?.bio ||
          newInput.gender !== profile?.gender
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
        dispatch(setProfile(res.data.user));
        success('toast.success.profileUpdated');
        setInput({
          name: res.data.user.name,
          bio: res.data.user.bio,
          gender: res.data.user.gender,
        });
        setIsDirty(false);
      }
    } catch (error) {
      console.log(error.response?.data?.message);
      error('toast.error.profileUpdate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`flex max-w-2xl mt-4 mx-auto pl-10 ${classes.container}`}>
      <section className="flex flex-col gap-6 w-full">
        <h1 className={`font-bold text-xl ${classes.heading}`}>{t('settings.editProfile')}</h1>

        {/* Avatar */}
        <div className={`flex items-center justify-between rounded-xl p-4 ${classes.bgSecondary}`}>
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12">
              <AvatarImage
                src={profile?.profilePicture}
                alt="user_profilePicture"
              />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div>
              <h1 className={`font-bold text-sm ${classes.heading}`}>{profile?.username}</h1>
              <span className={`text-sm ${classes.subheading}`}>
                {profile?.name || "Name here..."}
              </span>
            </div>
          </div>

          <AvatarMenu>
            <Button className={`${classes.buttonPrimary} h-8`}>
              {t('common.edit')}
            </Button>
          </AvatarMenu>
        </div>

        {/* Name */}
        <div>
          <h1 className={`font-bold text-xl mb-2 ${classes.heading}`}>{t('auth.name')}</h1>
          <Textarea
            value={input.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            className={`focus-visible:ring-transparent ${classes.input}`}
          />
        </div>

        {/* Bio */}
        <div>
          <h1 className={`font-bold text-xl mb-2 ${classes.heading}`}>Bio</h1>
          <Textarea
            value={input.bio}
            onChange={(e) => handleInputChange("bio", e.target.value)}
            className={`focus-visible:ring-transparent ${classes.input}`}
          />
        </div>

        {/* Gender */}
        <div>
          <h1 className={`font-bold text-xl mb-2 ${classes.heading}`}>{t('auth.gender')}</h1>
          <Select
            value={input.gender}
            onValueChange={(v) => handleInputChange("gender", v)}
          >
            <SelectTrigger className={`w-full ${classes.input}`}>
              <SelectValue placeholder={t('auth.gender')} />
            </SelectTrigger>
            <SelectContent className={classes.card}>
              <SelectItem value="male" className={`${classes.body} ${classes.hover}`}>{t('auth.male')}</SelectItem>
              <SelectItem value="female" className={`${classes.body} ${classes.hover}`}>{t('auth.female')}</SelectItem>
              <SelectItem value="other" className={`${classes.body} ${classes.hover}`}>{t('auth.other')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Submit button */}
        <div className="flex justify-between">
          <Link to={`/profile/${profile.username}`}>
            <Button className={`w-fit ${classes.buttonSecondary} disabled:opacity-50`}>
              {t('common.cancel')}
            </Button>
          </Link>
          <Button
            onClick={editProfileHandler}
            disabled={!isDirty || loading}
            className={`w-fit ${classes.buttonPrimary} disabled:opacity-50`}
          >
            {loading ? (
              <Loader2 className="animate-spin mr-2 h-4 w-4" />
            ) : (
              t('common.save')
            )}
          </Button>
        </div>
      </section>
    </div>
  );
};

export default EditProfile;
