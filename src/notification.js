import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bell } from 'lucide-react';
import { format, isValid } from 'date-fns';

const NotificationsDropdown = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/leave-requests/pending', {
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
      await axios.patch(`http://localhost:5000/api/leave-requests/${id}/mark-read`, {}, {
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
    const startDate = new Date(start);
    const endDate = new Date(end);
    if (isNaN(startDate) || isNaN(endDate)) return 'Invalid Date';
    return `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d')}`;
  };
  

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="relative">
        <Bell className="text-white" />
        {notifications.some((n) => !n.isRead) && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
            {notifications.filter((n) => !n.isRead).length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 shadow-lg rounded-md overflow-hidden z-50">
          <div className="px-4 py-2 border-b text-sm font-semibold dark:text-white">
            New Leave Requests
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="p-4 text-sm text-gray-500">No new requests</p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  onClick={() => markAsRead(n._id)}
                  className={`px-4 py-2 cursor-pointer border-b hover:bg-gray-100 dark:hover:bg-gray-700 text-sm ${
                    n.isRead
                      ? 'bg-white dark:bg-gray-900 text-gray-500'
                      : 'bg-blue-100 dark:bg-blue-900 text-black dark:text-white font-medium'
                  }`}
                >
                  <p className="font-medium">{n.employeeName || 'Unknown'}</p>
                  <p className="text-xs">{formatRange(n.from, n.to)}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsDropdown;
