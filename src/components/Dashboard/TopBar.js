import React, { useEffect, useState } from "react";
import {
  BellIcon,
  MoonIcon,
  SunIcon,
  ArrowRightEndOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import NotificationDropdown from "../../notification";
const Topbar = () => {
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light"); 
    }
  }, [darkMode]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <header className="w-full h-16 px-6 bg-white dark:bg-[#1f2937] border-b dark:border-gray-700 flex items-center justify-between shadow-sm">
      <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Dashboard</h1>

      <div className="flex items-center gap-4">
        {/* Notification Icon */}
        <div className="relative">
        <NotificationDropdown />
           
        </div>

        {/* Theme Toggle */}
        <button onClick={() => setDarkMode(!darkMode)} className="focus:outline-none">
          {darkMode ? (
            <SunIcon className="h-6 w-6 text-yellow-400" />
          ) : (
            <MoonIcon className="h-6 w-6 text-gray-600" />
          )}
        </button>

        {/* Avatar & Dropdown */}
        <div className="relative">
          <button onClick={() => setDropdownOpen(!dropdownOpen)} className="focus:outline-none">
            <img
              src="/avatar.png"
              alt="User"
              className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600 object-cover"
            />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-50">
              <button
                onClick={() => navigate("/profile")}
                className="w-full px-4 py-2 text-left text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                My Profile
              </button>
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-800"
              >
                <ArrowRightEndOnRectangleIcon className="h-4 w-4 inline-block mr-2" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
