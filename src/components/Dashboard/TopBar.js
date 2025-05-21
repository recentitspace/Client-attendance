import React, { useState, useContext, useEffect } from "react";
import {
  BellIcon,
  MoonIcon,
  SunIcon,
  ArrowRightEndOnRectangleIcon,
  MagnifyingGlassIcon,
  UserIcon
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import NotificationDropdown from "../../notification";
import { ThemeContext } from "../Context/ThemeContext";
import axios from "axios";

const baseURL = process.env.REACT_APP_API_BASE;

const Topbar = () => {
  const { darkMode, setDarkMode } = useContext(ThemeContext);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${baseURL}api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    
    fetchUserData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <header className="w-full px-6 py-4 flex items-center justify-between transition-all duration-200 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center">
        <h1 className="text-base font-medium text-gray-700 dark:text-gray-200">
          Dashboard
        </h1>
        
      
      </div>

      <div className="flex items-center gap-5">
        {/* Notification Icon */}
        <div className="relative">
          <NotificationDropdown />
        </div>

        {/* Theme Toggle */}
        <button 
          onClick={() => setDarkMode(!darkMode)} 
          className="p-1.5 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none transition-colors duration-200"
        >
          {darkMode ? (
            <SunIcon className="h-5 w-5 text-yellow-400" />
          ) : (
            <MoonIcon className="h-5 w-5" />
          )}
        </button>

        {/* Avatar & User Info */}
        <div className="relative">
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen)} 
            className="flex items-center focus:outline-none"
          >
            <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-200">
              <img
                src={user?.image ? `${baseURL}${user.image}` : `https://ui-avatars.com/api/?name=${user?.username || 'User'}&background=209ACF&color=fff`}
                alt="User"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="ml-2 text-left">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{user?.username || "Admin User"}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.role || "Administrator"}</p>
            </div>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-md z-50 border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-300 dark:border-gray-700">
                    <img
                      src={user?.image ? `${baseURL}${user.image}` : `https://ui-avatars.com/api/?name=${user?.username || 'User'}&background=209ACF&color=fff`}
                      alt="User"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-medium text-gray-700 dark:text-gray-200">{user?.username || "Admin User"}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.role || "Administrator"}</p>
                  </div>
                </div>
              </div>
              
              <div className="p-2">
                <button
                  onClick={() => navigate('/profile')}
                  className="w-full px-3 py-1.5 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md flex items-center"
                >
                  <UserIcon className="h-4 w-4 mr-2" />
                  My Profile
                </button>
                
                <button
                  onClick={handleLogout}
                  className="w-full px-3 py-1.5 text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-gray-700 rounded-md flex items-center"
                >
                  <ArrowRightEndOnRectangleIcon className="h-4 w-4 mr-2" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
