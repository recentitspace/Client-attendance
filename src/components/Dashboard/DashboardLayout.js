import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  HomeIcon,
  UserGroupIcon,
  ChartBarIcon,
  DocumentIcon,
  SpeakerWaveIcon,
  DocumentTextIcon,
  QrCodeIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";
import axios from 'axios';
const baseURL = process.env.REACT_APP_API_BASE;

const DashboardLayout = ({ children }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${baseURL}api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data);
        if (response.data.role !== 'admin') {
          navigate('/login');
        }
      } catch (error) {
        console.error('Error checking admin role:', error);
        navigate('/login');
      }
    };
    checkAdmin();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-dark text-gray-900 dark:text-white">
      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-[#1f2937] text-gray-900 dark:text-gray-100 shadow-lg flex flex-col border-r dark:border-gray-700">
        <div className="p-6 font-bold text-2xl text-left border-b dark:border-gray-700">
          <span className="text-[#209ACF]">Atten</span>do
        </div>

        <nav className="flex-grow p-4 space-y-2">
          {[
            { to: '/dashboard', icon: HomeIcon, label: 'Dashboard' },
            { to: '/employees', icon: UserGroupIcon, label: 'Employees' },
            { to: '/attendance', icon: ClipboardDocumentListIcon, label: 'Attendance' },
            { to: '/leave-requests', icon: DocumentTextIcon, label: 'Leave Requests' },
            { to: '/timetable', icon: DocumentTextIcon, label: 'Time Table' },
            { to: '/Reports', icon: ChartBarIcon, label: 'Reports' },
            { to: '/announcements', icon: SpeakerWaveIcon, label: 'Announcements' },
            { to: '/config', icon: QrCodeIcon, label: 'Config Manager' },
          ].map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center p-3 rounded-lg transition duration-200 ${
                  isActive
                    ? 'bg-blue-100 text-blue-700 font-medium dark:bg-[#209ACF] dark:text-[#ffff]'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200'
                }`
              }
            >
              <Icon className="h-5 w-5 mr-3" />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-grow p-6 overflow-auto bg-gray-50 dark:bg-[#111827]">
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;
