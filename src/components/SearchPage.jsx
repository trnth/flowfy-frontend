import React, { useEffect, useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { X } from "lucide-react";

const SearchPage = ({ open, setOpen }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isInboxPage = location.pathname.startsWith("/direct/inbox");
  const { isDark } = useTheme();
  const { t } = useLanguage();

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (searchQuery.trim() === "") {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }
      setIsSearching(true);
      try {
        const res = await axios.get(
          `http://localhost:5000/api/v1/user/search?query=${searchQuery}`,
          { withCredentials: true }
        );
        setSearchResults(res.data.users || []);
      } catch (error) {
        console.error(t("search.error"), error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };
    const timeout = setTimeout(fetchSearchResults, 300); // Debounce
    return () => clearTimeout(timeout);
  }, [searchQuery, t]);

  // Reset search when dialog closes
  useEffect(() => {
    if (!open) {
      setSearchQuery("");
      setSearchResults([]);
      setIsSearching(false);
    }
  }, [open]);

  return (
    <>
      {/* Overlay - trong suốt để nhìn thấy các component phía sau */}
      {open && (
        <div
          className="fixed top-0 left-[430px] right-0 bottom-0 bg-transparent z-[9998] md:left-[430px]"
          onClick={() => setOpen(false)}
        />
      )}

      <div
        className={`fixed top-0 left-[80px] w-[calc(100%-80px)] md:w-[350px] h-screen bg-white dark:bg-slate-900 z-[9999] transition-all duration-300 ease-in-out overflow-hidden ${
          open
            ? "translate-x-0 border-r border-slate-200 dark:border-slate-700 opacity-100 visible"
            : "-translate-x-full pointer-events-none opacity-0 invisible"
        }`}
      >
        <div className="p-4 overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {t("sidebar.search")}
            </h2>
            <button
              onClick={() => setOpen(false)}
              className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="relative">
            <Input
              type="text"
              placeholder={t("search.placeholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mb-4 w-full max-w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-700 placeholder-slate-500 dark:placeholder-slate-400 pr-10"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="space-y-4">
            {isSearching ? (
              <p className="text-slate-600 dark:text-slate-300 text-center">
                {t("search.searching")}
              </p>
            ) : searchResults.length === 0 && searchQuery ? (
              <p className="text-slate-600 dark:text-slate-300 text-center">
                {t("search.noResults")}
              </p>
            ) : (
              searchResults.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center gap-3 p-2 hover:bg-slate-50 dark:bg-slate-800 rounded-lg cursor-pointer transition-colors duration-300"
                  onClick={() => navigate(`/profile/${user?.username}`)}
                >
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={user.profilePicture} />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {user.username}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      {user.name}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default SearchPage;
