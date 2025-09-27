import React from "react";
import { Outlet } from "react-router-dom";
import LeftSidebar from "@/components/LeftSidebar";
import { useTheme } from "@/contexts/ThemeContext";

const MainLayout = () => {
  const { isDark } = useTheme();

  return (
    <div
      className={`min-h-screen transition-colors ${
        isDark ? "bg-slate-900" : "bg-white"
      }`}
    >
      <div>
        <LeftSidebar />
      </div>
      <div>
        <Outlet />
      </div>
    </div>
  );
};

export default MainLayout;
