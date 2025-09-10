import React, { useEffect, useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const SearchPage = ({ open, setOpen }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (searchQuery.trim() === "") {
        setSearchResults([]);
        return;
      }
      try {
        const res = await axios.get(
          `http://localhost:5000/api/v1/user/search?query=${searchQuery}`,
          { withCredentials: true }
        );
        setSearchResults(res.data.users || []);
      } catch (error) {
        console.error("Lỗi tìm kiếm:", error);
      }
    };
    const timeout = setTimeout(fetchSearchResults, 300); // Debounce
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  return (
    <div
      className={`fixed top-0 left-[80px] w-[calc(100%-80px)] md:w-[350px] h-screen bg-white   z-20 transition-all duration-300 ease-in-out ${
        open ? "translate-x-0 border-r border-gray-300" : "-translate-x-full "
      }`}
    >
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Tìm kiếm</h2>
        <Input
          type="text"
          placeholder="Tìm kiếm người dùng..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mb-4"
        />
        <div className="space-y-4">
          {searchResults.length === 0 && searchQuery ? (
            <p>Không tìm thấy kết quả</p>
          ) : (
            searchResults.map((user) => (
              <div
                key={user._id}
                className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg cursor-pointer"
                onClick={() => navigate(`/profile/${user?.username}`)}
              >
                <Avatar className="w-10 h-10">
                  <AvatarImage src={user.profilePicture} />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-bold">{user.username}</p>
                  <p className="text-xs text-gray-500">{user.name}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
