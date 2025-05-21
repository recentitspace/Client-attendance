import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  HomeIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  DocumentTextIcon,
  ChartBarIcon,
  SpeakerWaveIcon,
  QrCodeIcon,
  Cog6ToothIcon,
  ArrowRightEndOnRectangleIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import Topbar from './TopBar';
import { useNavigate } from 'react-router-dom';

const DashboardLayout = ({ children }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', icon: HomeIcon, label: 'Dashboard' },
    { to: '/employees', icon: UserGroupIcon, label: 'Employees' },
    { to: '/attendance', icon: ClipboardDocumentListIcon, label: 'Attendance' },
    { to: '/leave-requests', icon: DocumentTextIcon, label: 'Leave Requests' },
    { to: '/timetable', icon: CalendarIcon, label: 'Time Table' },
    { to: '/holiday', icon: CalendarIcon, label: 'Holidays' },
    { to: '/reports', icon: ChartBarIcon, label: 'Reports' },
    { to: '/announcements', icon: SpeakerWaveIcon, label: 'Announcements' },
    { to: '/config', icon: Cog6ToothIcon, label: 'Config Manager' },
  ];

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-gray-800 flex flex-col border-r dark:border-gray-700 transition-all duration-300">
        {/* Logo */}
        <div className="p-6 border-b dark:border-gray-700">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-md bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg mr-3">
              A
            </div>
            <h1 className="font-bold text-xl">
              <span className="text-blue-600">Atten</span>
              <span className="dark:text-white">do</span>
            </h1>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-grow overflow-y-auto py-4 px-3">
          <div className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center px-4 py-2.5 rounded-lg transition-all duration-200 group ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-medium'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                  }`
                }
              >
                <item.icon className={`h-5 w-5 mr-3 transition-colors duration-200`} />
                <span>{item.label}</span>
                {item.to === '/dashboard' && (
                  <span className="ml-auto bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400 text-xs font-medium px-2 py-0.5 rounded-full">
                    New
                  </span>
                )}
              </NavLink>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t dark:border-gray-700">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-lg transition-colors duration-200"
          >
            <ArrowRightEndOnRectangleIcon className="h-5 w-5 mr-3 text-gray-500 dark:text-gray-400" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
