import React, { useState } from "react";
import EditProfile from "./EditProfile";
import PrivacySetting from "./PrivacySetting.jsx";

const Setting = () => {
  const [activeTab, setActiveTab] = useState("edit"); // "edit" | "privacy"

  return (
    <div className="flex max-w-4xl mx-auto mt-6 gap-6">
      {/* Cột trái: menu */}
      <div className="w-1/4 flex flex-col gap-2">
        <button
          className={`p-3 rounded-lg text-left ${
            activeTab === "edit"
              ? "bg-blue-500 text-white font-semibold"
              : "bg-gray-100"
          }`}
          onClick={() => setActiveTab("edit")}
        >
          Edit Profile
        </button>
        <button
          className={`p-3 rounded-lg text-left ${
            activeTab === "privacy"
              ? "bg-blue-500 text-white font-semibold"
              : "bg-gray-100"
          }`}
          onClick={() => setActiveTab("privacy")}
        >
          Privacy
        </button>
      </div>

      {/* Cột phải: nội dung theo tab */}
      <div className="w-3/4">
        {activeTab === "edit" && <EditProfile />}
        {activeTab === "privacy" && <PrivacySetting />}
      </div>
    </div>
  );
};

export default Setting;
