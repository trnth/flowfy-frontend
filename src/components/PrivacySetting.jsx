import React, { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "./ui/button";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { setProfile } from "@/redux/authSlice";
import { Shield, Eye, EyeOff, Users, Lock } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useToast } from "@/contexts/ToastContext";

const PrivacySetting = () => {
  const { profile } = useSelector((store) => store.auth);
  const dispatch = useDispatch();
  const { t } = useLanguage();
  const { isDark } = useTheme();
  const { success, error } = useToast();

  const [privacy, setPrivacy] = useState(profile?.privacy || "public");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile?.privacy) {
      setPrivacy(profile.privacy);
    }
  }, [profile?.privacy]);

  const isDirty = privacy !== profile?.privacy;

  const updatePrivacy = async () => {
    try {
      setLoading(true);
      const res = await axios.post(
        "/user/profile/privacy",
        { privacy },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      if (res.data.success) {
        dispatch(setProfile(res.data.user));
        success('toast.success.settingsSaved');
      }
    } catch (err) {
      error('toast.error.settingsSave');
    } finally {
      setLoading(false);
    }
  };

  const privacyOptions = [
    {
      value: "public",
      label: t('privacy.public'),
      description: t('privacy.publicDesc'),
      icon: <Users className="w-5 h-5" />
    },
    {
      value: "private",
      label: t('privacy.private'),
      description: t('privacy.privateDesc'),
      icon: <Lock className="w-5 h-5" />
    }
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border-slate-200 dark:border-slate-700 border p-6">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="w-6 h-6 text-blue-600" />
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{t('privacy.title')}</h2>
      </div>
      
      <div className="space-y-6">
        <div>
          <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-3">{t('privacy.accountPrivacy')}</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
            Control who can see your posts and follow you
          </p>
          
          <div className="space-y-3">
            {privacyOptions.map((option) => (
              <div
                key={option.value}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  privacy === option.value
                    ? "border-blue-500 bg-blue-50"
                    : "theme-border-primary hover:theme-border-secondary"
                }`}
                onClick={() => setPrivacy(option.value)}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 ${
                    privacy === option.value ? "text-blue-600" : "theme-text-tertiary"
                  }`}>
                    {option.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className={`font-medium ${
                        privacy === option.value ? "text-blue-900" : "theme-text-primary"
                      }`}>
                        {option.label}
                      </h4>
                      {privacy === option.value && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      )}
                    </div>
                    <p className={`text-sm mt-1 ${
                      privacy === option.value ? "text-blue-700" : "theme-text-secondary"
                    }`}>
                      {option.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {isDirty && (
          <div className={`flex items-center justify-between p-4 rounded-lg ${
            isDark ? "bg-yellow-900/20 border-yellow-700" : "bg-yellow-50 border-yellow-200"
          } border`}>
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-yellow-600" />
              <span className="text-sm text-slate-900 dark:text-slate-100">
                You have unsaved changes
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPrivacy(profile?.privacy || "public")}
                disabled={loading}
                className="border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:bg-slate-800"
              >
                {t('common.cancel')}
              </Button>
              <Button
                size="sm"
                onClick={updatePrivacy}
                disabled={loading}
                className="text-blue-600-bg hover:text-blue-600-hover"
              >
                {loading ? t('common.loading') : t('common.save')}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrivacySetting;
