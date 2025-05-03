import React, { useEffect, useState } from 'react';
import { Pie, Line } from 'react-chartjs-2';
import axios from 'axios';
import DashboardLayout from './DashboardLayout';
import Topbar from './TopBar';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [analytics, setAnalytics] = useState({});
  const [weeklyTrend, setWeeklyTrend] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    fetchAnalytics();
    fetchWeeklyTrend();
    fetchAttendance();
  }, []);

  const fetchAnalytics = async () => {
    const token = localStorage.getItem('token');
    const res = await axios.get('http://localhost:5000/api/attendance/overall', {
      headers: { Authorization: `Bearer ${token}` },
    });
    setAnalytics(res.data.data);
  };

  const fetchWeeklyTrend = async () => {
    const token = localStorage.getItem('token');
    const res = await axios.get('http://localhost:5000/api/attendance/weekly', {
      headers: { Authorization: `Bearer ${token}` },
    });
    setWeeklyTrend(res.data.data);
  };

  const fetchAttendance = async () => {
    const token = localStorage.getItem('token');
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() - currentPage);
    const selectedDateStr = targetDate.toISOString().split('T')[0];
    const res = await axios.get(
      `http://localhost:5000/api/attendance/date?date=${selectedDateStr}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (res.data.success) {
      setAttendance(res.data.data);
    }
  };

  const pieData = {
    labels: ['Present', 'Absent', 'On Leave'],
    datasets: [
      {
        data: [analytics.present || 0, analytics.absent || 0, analytics.onLeave || 0],
        backgroundColor: ['#209ACF', '#E0E0E0', '#9EB2BF'],
        borderWidth: 1,
      },
    ],
  };

  const lineData = {
    labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    datasets: [
      {
        label: 'Present',
        data: weeklyTrend,
        borderColor: '#219CD0',
        tension: 0.4,
      },
    ],
  };

  const getEmployee = (record) => ({
    username: record.username || 'Unknown',
    image: record.image || null,
    deviceID: record.deviceID,
  });

  const formatTime = (isoTime) => {
    if (!isoTime || isoTime === 'N/A') return '-';
    const date = new Date(isoTime);
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <Topbar />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <SummaryCard label="Present" value={analytics.present || 0} />
          <SummaryCard label="Absent" value={analytics.absent || 0} />
          <SummaryCard label="On Leave" value={analytics.onLeave || 0} />
          <SummaryCard label="Late" value={analytics.partial || 0} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
            <h3 className="font-semibold mb-4 dark:text-white">Attendance Overview</h3>
            <div className="w-full h-[300px]">
              <Pie data={pieData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
            <div className="flex justify-between mb-4">
              <h3 className="font-semibold dark:text-white">Attendance Trend</h3>
              <select className="text-sm border px-2 py-1 rounded" disabled>
                <option>Week</option>
              </select>
            </div>
            <div className="h-[300px]">
              <Line data={lineData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
          <h3 className="font-semibold mb-4 dark:text-white">Attendance of Today</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left bg-gray-100 dark:bg-gray-700 dark:text-white">
                <th className="py-2 px-3">Employee</th>
                <th className="py-2 px-3">Check-In</th>
                <th className="py-2 px-3">Check-Out</th>
                <th className="py-2 px-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map((record, i) => {
                const emp = getEmployee(record);
                return (
                  <tr key={i} className="border-t dark:border-gray-600">
                    <td className="flex items-center gap-3 px-3 py-2">
                      <img
                        src={
                          emp.image
                            ? `http://localhost:5000/${emp.image}`
                            : `https://ui-avatars.com/api/?name=${emp.username || 'Unknown'}`
                        }
                        alt="avatar"
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <div className="font-medium text-gray-800 dark:text-white">
                          {emp.username}
                        </div>
                        <div className="text-gray-400 text-xs">{record.deviceID}</div>
                      </div>
                    </td>
                    <td className="py-2 px-3 dark:text-white">{formatTime(record.checkInTime)}</td>
                    <td className="py-2 px-3 dark:text-white">{formatTime(record.checkOutTime)}</td>
                    <td
                      className={`py-2 px-3 font-medium ${
                        record.status === 'absent'
                          ? 'text-red-500'
                          : record.status === 'onLeave'
                          ? 'text-blue-500'
                          : 'text-green-500'
                      }`}
                    >
                      {record.status}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

const SummaryCard = ({ label, value }) => (
  <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow text-center">
    <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
    <p className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">{value}</p>
  </div>
);

export default Dashboard;
