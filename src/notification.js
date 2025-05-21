import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bell } from 'lucide-react';
import { format, isValid } from 'date-fns';
import { useNavigate } from 'react-router-dom';
const baseURL = process.env.REACT_APP_API_BASE || 'http://localhost:5000/';

const NotificationsDropdown = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${baseURL}api/leave-requests/pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(res.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${baseURL}api/leave-requests/${id}/mark-read`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (error) {
      console.error('Mark read error:', error);
    }
  };

  const formatRange = (start, end) => {
    if (!start || !end) return 'Invalid Date';
    
    try {
      // Parse dates from ISO format
      const startDate = new Date(start);
      const endDate = new Date(end);
      
      // Check if dates are valid
      if (!isValid(startDate) || !isValid(endDate)) {
        return 'Invalid Date';
      }
      
      // Format to "May 20 - May 22" style
      return `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d')}`;
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Invalid Date';
    }
  };
  
  useEffect(() => {
    fetchNotifications();
  }, []);

  // Get initials from a name
  const getInitials = (name) => {
    if (!name) return 'UN';
    
    const parts = name.split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setOpen(!open)} 
        className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30"
      >
        <Bell className="h-5 w-5 text-gray-600 dark:text-white" />
        {notifications.some((n) => !n.isRead) && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
            {notifications.filter((n) => !n.isRead).length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden z-50 border border-gray-100 dark:border-gray-700 animate-fadeIn">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <h3 className="font-semibold text-gray-800 dark:text-white">New Leave Requests</h3>
            {notifications.some(n => !n.isRead) && (
              <span className="text-xs bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 px-2 py-0.5 rounded-full font-medium">
                {notifications.filter(n => !n.isRead).length} new
              </span>
            )}
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-3">
                  <Bell className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">No new requests</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">All caught up!</p>
              </div>
            ) : (
              <>
                {notifications.map((n) => (
                  <div
                    key={n._id}
                    onClick={() => markAsRead(n._id)}
                    className={`px-4 py-3 cursor-pointer border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150 ${
                      n.isRead
                        ? 'bg-white dark:bg-gray-800'
                        : 'bg-blue-50 dark:bg-blue-900/20'
                    }`}
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mr-3">
                        <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-medium">
                          {getInitials(n.employeeName)}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={`font-medium text-gray-800 dark:text-white truncate ${!n.isRead && 'font-semibold'}`}>
                            {n.employeeName || 'Unknown Employee'}
                          </p>
                          {!n.isRead && (
                            <span className="ml-2 w-2 h-2 rounded-full bg-primary flex-shrink-0"></span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          Leave request: {formatRange(n.from, n.to)}
                        </p>
                        <div className="flex items-center mt-1.5">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 font-medium">
                            Pending
                          </span>
                          <span className="text-xs text-gray-400 dark:text-gray-500 ml-2">
                            Unknown date
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="p-3 bg-gray-50 dark:bg-gray-800/80 border-t border-gray-100 dark:border-gray-700">
                  <button 
                    onClick={() => {
                      navigate('/leave-requests');
                      setOpen(false);
                    }} 
                    className="w-full py-2 text-xs font-medium text-primary hover:text-primary-dark dark:hover:text-primary-light transition-colors"
                  >
                    View all requests
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsDropdown;
