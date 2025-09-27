import React, { useState, useEffect } from "react";
import EditProfile from "./EditProfile";
import PrivacySetting from "./PrivacySetting.jsx";
import ThemeLanguageDemo from "./ThemeLanguageDemo";
import { 
  User, 
  Shield, 
  Eye, 
  Palette, 
  Key, 
  Smartphone, 
  HelpCircle,
  LogOut,
  ChevronRight,
  Globe
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { resetAuth, setProfile } from "@/redux/authSlice";
import { useToast } from "@/contexts/ToastContext";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";

const Setting = () => {
  const [activeTab, setActiveTab] = useState("edit");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { profile } = useSelector((store) => store.auth);
  const { t } = useLanguage();
  const { isDark } = useTheme();

  const menuItems = [
    { id: "edit", label: t('settings.editProfile'), icon: User, component: EditProfile },
    { id: "privacy", label: t('settings.privacy'), icon: Shield, component: PrivacySetting },
    { id: "security", label: t('settings.security'), icon: Key, component: SecuritySettings },
    { id: "appearance", label: t('settings.appearance'), icon: Palette, component: AppearanceSettings },
    { id: "demo", label: "Theme & Language Demo", icon: Globe, component: ThemeLanguageDemo },
    { id: "account", label: t('settings.account'), icon: Smartphone, component: AccountSettings },
    { id: "help", label: t('settings.help'), icon: HelpCircle, component: HelpSettings },
  ];

  const handleLogout = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/v1/auth/logout", {
        withCredentials: true,
      });
      dispatch(resetAuth());
      if (res.data.success) {
        navigate("/login");
        toast.success(res.data.message);
      }
    } catch (error) {
      console.error("Lỗi đăng xuất:", error);
      toast.error("Có lỗi xảy ra khi đăng xuất");
    }
  };

  const renderComponent = () => {
    const item = menuItems.find(item => item.id === activeTab);
    return item ? <item.component /> : null;
  };

  return (
    <div className="flex max-w-6xl mx-auto mt-6 gap-8">
      {/* Cột trái: menu */}
      <div className="w-80 flex flex-col gap-1">
        <div className="mb-4">
          <h1 className={`text-2xl font-bold ${
            isDark ? "text-white" : "text-gray-900"
          }`}>{t('settings.title')}</h1>
          <p className={`text-sm mt-1 ${
            isDark ? "text-gray-400" : "text-gray-600"
          }`}>Manage your account settings and preferences</p>
        </div>
        
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
        <button
              key={item.id}
              className={`flex items-center justify-between p-4 rounded-xl text-left transition-all duration-200 group ${
                activeTab === item.id
                  ? "bg-blue-50 text-blue-600 border border-blue-200"
                  : isDark 
                    ? "hover:bg-gray-800 text-gray-300 hover:text-white"
                    : "hover:bg-gray-50 text-gray-700"
              }`}
              onClick={() => setActiveTab(item.id)}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 ${
                  activeTab === item.id 
                    ? "text-blue-600" 
                    : isDark ? "text-gray-400" : "text-gray-500"
                }`} />
                <span className={`font-medium ${
                  activeTab === item.id 
                    ? "text-blue-600" 
                    : isDark ? "text-gray-300" : "text-gray-700"
                }`}>
                  {item.label}
                </span>
              </div>
              <ChevronRight className={`w-4 h-4 transition-transform ${
                activeTab === item.id 
                  ? "text-blue-600 rotate-90" 
                  : isDark 
                    ? "text-gray-500 group-hover:text-gray-300"
                    : "text-gray-400 group-hover:text-gray-600"
              }`} />
        </button>
          );
        })}
        
        {/* Logout button */}
        <div className={`mt-8 pt-4 border-t ${
          isDark ? "border-gray-700" : "border-gray-200"
        }`}>
          <button 
            onClick={handleLogout}
            className={`flex items-center gap-3 p-4 rounded-xl text-left text-red-600 transition-all duration-200 w-full ${
              isDark ? "hover:bg-red-900/20" : "hover:bg-red-50"
            }`}
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">{t('settings.logout')}</span>
        </button>
        </div>
      </div>

      {/* Cột phải: nội dung theo tab */}
      <div className="flex-1">
        {renderComponent()}
      </div>
    </div>
  );
};


const SecuritySettings = () => {
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const { success, error } = useToast();

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      error('toast.error.validation');
      return;
    }
    if (newPassword.length < 6) {
      error('toast.error.validation');
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:5000/api/v1/auth/change-password",
        {
          currentPassword,
          newPassword,
        },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      
      if (res.data.success) {
        success('toast.success.passwordChanged');
        setShowChangePassword(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (error) {
      error('toast.error.passwordChange');
    }
  };

  return (
    <div className={`rounded-xl border p-6 ${
      isDark 
        ? "bg-gray-800 border-gray-700" 
        : "bg-white border-gray-200"
    }`}>
      <h2 className={`text-xl font-semibold mb-6 ${
        isDark ? "text-white" : "text-gray-900"
      }`}>{t('settings.security')}</h2>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className={`font-medium ${
              isDark ? "text-white" : "text-gray-900"
            }`}>{t('security.twoFactor')}</h3>
            <p className={`text-sm ${
              isDark ? "text-gray-400" : "text-gray-600"
            }`}>Add an extra layer of security to your account</p>
          </div>
          <button 
            onClick={() => toast.info("Tính năng đang được phát triển")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Enable
          </button>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h3 className={`font-medium ${
              isDark ? "text-white" : "text-gray-900"
            }`}>{t('security.changePassword')}</h3>
            <p className={`text-sm ${
              isDark ? "text-gray-400" : "text-gray-600"
            }`}>Update your account password</p>
          </div>
          <button 
            onClick={() => setShowChangePassword(!showChangePassword)}
            className={`px-4 py-2 border rounded-lg transition-colors ${
              isDark 
                ? "border-gray-600 text-gray-300 hover:bg-gray-700" 
                : "border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            {showChangePassword ? t('common.cancel') : t('security.changePassword')}
          </button>
        </div>

        {showChangePassword && (
          <form onSubmit={handleChangePassword} className={`mt-4 p-4 border rounded-lg space-y-4 ${
            isDark 
              ? "border-gray-600 bg-gray-700" 
              : "border-gray-200 bg-gray-50"
          }`}>
            <div>
              <label className={`block text-sm font-medium mb-1 ${
                isDark ? "text-gray-300" : "text-gray-700"
              }`}>{t('security.currentPassword')}</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark 
                    ? "border-gray-600 bg-gray-800 text-white" 
                    : "border-gray-300 bg-white text-gray-900"
                }`}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Update Password
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

const AppearanceSettings = () => {
  const { theme, changeTheme } = useTheme();
  const { language, changeLanguage, t } = useLanguage();
  const [selectedTheme, setSelectedTheme] = useState(theme);
  const [selectedLanguage, setSelectedLanguage] = useState(language);

  useEffect(() => {
    setSelectedTheme(theme);
  }, [theme]);

  useEffect(() => {
    setSelectedLanguage(language);
  }, [language]);

  const handleThemeChange = (newTheme) => {
    setSelectedTheme(newTheme);
    changeTheme(newTheme);
  };

  const handleLanguageChange = (newLanguage) => {
    setSelectedLanguage(newLanguage);
    changeLanguage(newLanguage);
  };

  const getLanguageName = (code) => {
    const languages = {
      en: "English",
      vi: "Tiếng Việt"
    };
    return languages[code] || code;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">{t('settings.appearance')}</h2>
      <div className="space-y-6">
        <div>
          <h3 className="font-medium text-gray-900 mb-3">{t('appearance.theme')}</h3>
          <div className="grid grid-cols-3 gap-3">
            <button 
              onClick={() => handleThemeChange("light")}
              className={`p-4 border-2 rounded-lg bg-white transition-all ${
                selectedTheme === "light" 
                  ? "border-blue-500" 
                  : "border-gray-300 hover:border-gray-400"
              }`}
            >
              <div className="w-full h-8 bg-gray-100 rounded mb-2"></div>
              <span className="text-sm">{t('appearance.light')}</span>
            </button>
            <button 
              onClick={() => handleThemeChange("dark")}
              className={`p-4 border-2 rounded-lg bg-white transition-all ${
                selectedTheme === "dark" 
                  ? "border-blue-500" 
                  : "border-gray-300 hover:border-gray-400"
              }`}
            >
              <div className="w-full h-8 bg-gray-800 rounded mb-2"></div>
              <span className="text-sm">{t('appearance.dark')}</span>
            </button>
            <button 
              onClick={() => handleThemeChange("system")}
              className={`p-4 border-2 rounded-lg bg-white transition-all ${
                selectedTheme === "system" 
                  ? "border-blue-500" 
                  : "border-gray-300 hover:border-gray-400"
              }`}
            >
              <div className="w-full h-8 bg-gradient-to-r from-gray-100 to-gray-800 rounded mb-2"></div>
              <span className="text-sm">{t('appearance.system')}</span>
            </button>
          </div>
        </div>

        <div>
          <h3 className="font-medium text-gray-900 mb-3">{t('appearance.language')}</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { code: "en", name: "English", flag: "🇺🇸" },
              { code: "vi", name: "Tiếng Việt", flag: "🇻🇳" }
            ].map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`p-4 border-2 rounded-lg bg-white transition-all text-left ${
                  selectedLanguage === lang.code
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{lang.flag}</span>
                  <div>
                    <div className="font-medium text-sm">{lang.name}</div>
                    <div className="text-xs text-gray-500 uppercase">{lang.code}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const AccountSettings = () => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleDownloadData = async () => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/v1/user/export-data",
        {},
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      
      if (res.data.success) {
        toast.success("Data export started. You will receive an email when ready.");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to start data export");
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") {
      toast.error("Please type 'DELETE' to confirm");
      return;
    }

    try {
      const res = await axios.delete(
        "http://localhost:5000/api/v1/user/delete-account",
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      
      if (res.data.success) {
        toast.success("Account deletion request submitted");
        setShowDeleteConfirm(false);
        setDeleteConfirmText("");
        // Redirect to login after account deletion
        setTimeout(() => {
          dispatch(resetAuth());
          navigate("/login");
        }, 2000);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete account");
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Account Settings</h2>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-900">Download Your Data</h3>
            <p className="text-sm text-gray-600">Get a copy of your data</p>
          </div>
          <button 
            onClick={handleDownloadData}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Download
          </button>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-900">Delete Account</h3>
            <p className="text-sm text-gray-600">Permanently delete your account</p>
          </div>
          <button 
            onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            {showDeleteConfirm ? "Cancel" : "Delete"}
          </button>
        </div>

        {showDeleteConfirm && (
          <div className="mt-4 p-4 border border-red-200 rounded-lg bg-red-50">
            <h4 className="font-medium text-red-900 mb-2">⚠️ Delete Account</h4>
            <p className="text-sm text-red-700 mb-4">
              This action cannot be undone. All your data will be permanently deleted.
            </p>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-red-700 mb-1">
                  Type "DELETE" to confirm
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  className="w-full px-3 py-2 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="DELETE"
                />
              </div>
              <button
                onClick={handleDeleteAccount}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Permanently Delete Account
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const HelpSettings = () => {
  const handleHelpCenter = () => {
    toast.info("Help Center - Tính năng đang được phát triển");
  };

  const handleContactSupport = () => {
    toast.info("Contact Support - Tính năng đang được phát triển");
  };

  const handleReportProblem = () => {
    toast.info("Report Problem - Tính năng đang được phát triển");
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Help & Support</h2>
      <div className="space-y-4">
        <button 
          onClick={handleHelpCenter}
          className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <h3 className="font-medium text-gray-900">Help Center</h3>
          <p className="text-sm text-gray-600">Find answers to common questions</p>
        </button>
        
        <button 
          onClick={handleContactSupport}
          className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <h3 className="font-medium text-gray-900">Contact Support</h3>
          <p className="text-sm text-gray-600">Get help from our support team</p>
        </button>
        
        <button 
          onClick={handleReportProblem}
          className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <h3 className="font-medium text-gray-900">Report a Problem</h3>
          <p className="text-sm text-gray-600">Report bugs or issues</p>
        </button>
      </div>
    </div>
  );
};

export default Setting;
