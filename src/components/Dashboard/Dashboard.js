import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Line, Pie } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import { format, subDays, startOfWeek, endOfWeek, addWeeks, subWeeks, formatISO } from 'date-fns';
// import { flushSync } from 'react-dom';
import DashboardLayout from './DashboardLayout';
import Topbar from './TopBar';
const SimpleLoader = () => (
  <div className="flex justify-center items-center h-full w-full">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>
);

Chart.register(...registerables);
const baseURL = process.env.REACT_APP_API_BASE;

const Dashboard = () => {
  const [analytics, setAnalytics] = useState({});
  const [weeklyTrend, setWeeklyTrend] = useState([0, 0, 0, 0, 0, 0, 0]);
  const [attendance, setAttendance] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  // New state for week selection
  const [selectedWeek, setSelectedWeek] = useState('current');
  const [weekOptions, setWeekOptions] = useState([]);
  const [weekDropdownOpen, setWeekDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Generate week options (current week and previous 4 weeks)
  useEffect(() => {
    const options = [];
    const today = new Date();
    
    // Current week
    const currentWeekStart = startOfWeek(today, { weekStartsOn: 0 });
    const currentWeekEnd = endOfWeek(today, { weekStartsOn: 0 });
    options.push({
      value: 'current',
      label: 'This Week',
      startDate: currentWeekStart,
      endDate: currentWeekEnd
    });
    
    // Previous 4 weeks
    for (let i = 1; i <= 4; i++) {
      const weekStart = subWeeks(currentWeekStart, i);
      const weekEnd = subWeeks(currentWeekEnd, i);
      options.push({
        value: `week-${i}`,
        label: `Week ${i}`,
        startDate: weekStart,
        endDate: weekEnd
      });
    }
    
    setWeekOptions(options);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setWeekDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          fetchAnalytics(),
          fetchWeeklyTrend(),
          fetchAttendance()
        ]);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [currentPage]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${baseURL}api/attendance/overall`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // The API returns data directly in the response body, not in a nested data property
      const data = res.data || {};
      
      console.log('Analytics data received:', data);
      
      // Create analytics object with default values
      setAnalytics({
        present: data.present || 0,
        absent: data.absent || 0,
        onLeave: data.onLeave || 0,
        late: data.late || 0,
        earlyLeave: data.earlyLeave || 0
      });
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setAnalytics({
        present: 0,
        absent: 0,
        onLeave: 0,
        late: 0,
        earlyLeave: 0
      });
      setIsLoading(false);
    }
  };

  // Modified fetchWeeklyTrend to use selected week
  const fetchWeeklyTrend = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Find the selected week option
      const selectedWeekOption = weekOptions.find(option => option.value === selectedWeek);
      
      if (!selectedWeekOption) {
        console.error('Selected week option not found');
        setWeeklyTrend([0, 0, 0, 0, 0, 0, 0]);
        return;
      }
      
      // Use the actual date objects from the week options
      const startDate = format(selectedWeekOption.startDate, 'yyyy-MM-dd');
      const endDate = format(selectedWeekOption.endDate, 'yyyy-MM-dd');
      
      console.log(`Fetching weekly trend from ${startDate} to ${endDate}`);
      
      // Use the weekly endpoint instead of analytics
      const url = `${baseURL}api/attendance/weekly`;
      
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      console.log('Weekly trend response:', response.data);
      
      if (response.data && response.data.data) {
        // Scale the values to make them visible on the chart
        const scaledData = response.data.data.map(value => value * 10);
        setWeeklyTrend(scaledData);
      } else {
        setWeeklyTrend([0, 0, 0, 0, 0, 0, 0]);
      }
    } catch (error) {
      console.error('Error fetching weekly trend:', error);
      setWeeklyTrend([0, 0, 0, 0, 0, 0, 0]);
    }
  };

  // Update weekly trend when selected week changes
  useEffect(() => {
    if (weekOptions.length > 0) {
      fetchWeeklyTrend();
    }
  }, [selectedWeek, weekOptions]);

  const fetchAttendance = async () => {
    try {
      const token = localStorage.getItem('token');
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() - currentPage);
      const selectedDateStr = targetDate.toISOString().split('T')[0];
      
      console.log(`Dashboard: Fetching attendance for date: ${selectedDateStr}`);
      
      const res = await axios.get(
        `${baseURL}api/attendance/date?date=${selectedDateStr}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Check if records exist in the response, regardless of success flag
      if (res.data && res.data.records && res.data.records.length > 0) {
        console.log(`Dashboard: Received ${res.data.records.length} attendance records`);
        setAttendance(res.data.records);
      } else if (res.data && res.data.data && res.data.data.length > 0) {
        console.log(`Dashboard: Received ${res.data.data.length} attendance records from data property`);
        setAttendance(res.data.data);
      } else {
        console.log('Dashboard: No attendance records found in response', res.data);
        setAttendance([]);
      }
    } catch (error) {
      console.error('Dashboard: Error fetching attendance:', error);
      setAttendance([]);
    }
  };

  const handleDateChange = (direction) => {
    setCurrentPage(prev => Math.max(0, prev + direction));
  };

  const pieData = {
    labels: ['Present', 'Absent', 'On Leave', 'Late', 'EarlyLeave'],
    datasets: [
      {
        data: [
          analytics.present || 0, 
          analytics.absent || 0, 
          analytics.onLeave || 0,
          analytics.late || 0,
          analytics.earlyLeave || 0
        ],
        backgroundColor: [
          'rgba(16, 185, 129, 0.4)',  // Much lighter green
          'rgba(239, 68, 68, 0.4)',   // Much lighter red
          'rgba(59, 130, 246, 0.4)',  // Much lighter blue
          'rgba(245, 158, 11, 0.4)',  // Much lighter amber
          'rgba(168, 85, 247, 0.4)'   // Much lighter purple
        ],
        borderWidth: 1,
        borderColor: document.documentElement.classList.contains('dark') ? '#1f2937' : '#ffffff',
        hoverBackgroundColor: [
          'rgba(16, 185, 129, 0.6)',  // Slightly darker on hover but still light
          'rgba(239, 68, 68, 0.6)',   // Slightly darker on hover but still light
          'rgba(59, 130, 246, 0.6)',  // Slightly darker on hover but still light
          'rgba(245, 158, 11, 0.6)',  // Slightly darker on hover but still light
          'rgba(168, 85, 247, 0.6)'   // Slightly darker on hover but still light
        ],
        hoverOffset: 3,
      },
    ],
  };

  const pieOptions = { 
    responsive: true, 
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 11,
            weight: 'medium'
          },
          color: document.documentElement.classList.contains('dark') ? 'white' : '#333333'
        }
      },
      tooltip: {
        backgroundColor: document.documentElement.classList.contains('dark') ? 'rgba(31, 41, 55, 0.8)' : 'rgba(255, 255, 255, 0.9)',
        titleColor: document.documentElement.classList.contains('dark') ? 'white' : '#333333',
        bodyColor: document.documentElement.classList.contains('dark') ? 'white' : '#333333',
        borderColor: document.documentElement.classList.contains('dark') ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 6,
        displayColors: true,
        boxPadding: 3,
        titleFont: {
          weight: 'medium'
        }
      }
    },
    cutout: '65%', // Make the donut hole even larger
    animation: {
      animateScale: true,
      animateRotate: true,
      duration: 800
    }
  };

  const lineData = {
    labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    datasets: [
      {
        label: 'Present',
        data: weeklyTrend,
        borderColor: '#209ACF',
        backgroundColor: 'rgba(32, 154, 207, 0.2)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#209ACF',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const lineOptions = { 
    responsive: true, 
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          font: {
            size: 12,
            weight: 'bold'
          },
          color: document.documentElement.classList.contains('dark') ? 'white' : '#333333'
        }
      },
      tooltip: {
        backgroundColor: document.documentElement.classList.contains('dark') ? 'rgba(31, 41, 55, 0.8)' : 'rgba(255, 255, 255, 0.9)',
        titleColor: document.documentElement.classList.contains('dark') ? 'white' : '#333333',
        bodyColor: document.documentElement.classList.contains('dark') ? 'white' : '#333333',
        borderColor: document.documentElement.classList.contains('dark') ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        titleFont: {
          weight: 'bold'
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        min: 0,
        max: 20,  // Adjusted to show the scaled data better
        ticks: {
          stepSize: 5,
          color: document.documentElement.classList.contains('dark') ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
          font: {
            size: 11
          }
        },
        grid: {
          color: document.documentElement.classList.contains('dark') ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
        }
      },
      x: {
        ticks: {
          color: document.documentElement.classList.contains('dark') ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
          font: {
            size: 11
          }
        },
        grid: {
          color: document.documentElement.classList.contains('dark') ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
        }
      }
    }
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

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() - currentPage);

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 min-h-screen transition-colors duration-200">
      
        <div className="relative">
          <div className="absolute inset-0 bg-primary/5 dark:bg-primary/10 rounded-3xl blur-3xl opacity-50"></div>
          
          {isLoading ? (
            <div className="flex flex-col justify-center items-center h-64 relative z-10">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent"></div>
              <p className="mt-6 text-gray-600 dark:text-gray-300 font-medium">Loading dashboard data...</p>
            </div>
          ) : (
            <div className="space-y-6 relative z-10">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <SummaryCard 
                  label="Present" 
                  value={analytics.present || 0} 
                  color="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/10" 
                  textColor="text-green-700 dark:text-green-400" 
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600 dark:text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                  }
                />
                <SummaryCard 
                  label="Absent" 
                  value={analytics.absent || 0} 
                  color="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/10" 
                  textColor="text-red-700 dark:text-red-400" 
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600 dark:text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="15" y1="9" x2="9" y2="15"></line>
                      <line x1="9" y1="9" x2="15" y2="15"></line>
                    </svg>
                  }
                />
                <SummaryCard 
                  label="On Leave" 
                  value={analytics.onLeave || 0} 
                  color="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/10" 
                  textColor="text-blue-700 dark:text-blue-400" 
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                  }
                />
                <SummaryCard 
                  label="Late" 
                  value={analytics.late || 0} 
                  color="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/10" 
                  textColor="text-amber-700 dark:text-amber-400" 
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-600 dark:text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                  }
                />
                <SummaryCard 
                  label="EarlyLeave" 
                  value={analytics.earlyLeave || 0} 
                  color="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/10" 
                  textColor="text-purple-700 dark:text-purple-400" 
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600 dark:text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="8 12 12 16 16 12"></polyline>
                      <line x1="12" y1="8" x2="12" y2="16"></line>
                    </svg>
                  }
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 backdrop-blur-sm bg-opacity-80 dark:bg-opacity-80">
                  <h3 className="font-semibold mb-4 dark:text-white text-lg flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path>
                      <path d="M22 12A10 10 0 0 0 12 2v10z"></path>
                    </svg>
                    Attendance Overview
                  </h3>
                  <div className="w-full h-[300px]">
                    <Pie data={pieData} options={pieOptions} />
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 backdrop-blur-sm bg-opacity-80 dark:bg-opacity-80">
                  <div className="flex justify-between mb-4">
                    <h3 className="font-semibold dark:text-white text-lg flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                      </svg>
                      Weekly Attendance Trend
                    </h3>
                    <div className="relative" ref={dropdownRef}>
                      <button 
                        onClick={() => setWeekDropdownOpen(!weekDropdownOpen)}
                        className="text-sm border px-3 py-1.5 rounded-lg bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-primary focus:border-primary flex items-center"
                      >
                        {weekOptions.find(week => week.value === selectedWeek)?.label || 'This Week'}
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                      
                      {weekDropdownOpen && (
                        <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 border border-gray-200 dark:border-gray-700">
                          {weekOptions.map((option) => (
                            <button
                              key={option.value}
                              onClick={() => {
                                setSelectedWeek(option.value);
                                setWeekDropdownOpen(false);
                              }}
                              className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                                selectedWeek === option.value ? 'bg-gray-100 dark:bg-gray-700 font-medium' : ''
                              }`}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="h-[300px]">
                    <Line data={lineData} options={lineOptions} />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 backdrop-blur-sm bg-opacity-80 dark:bg-opacity-80">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-semibold dark:text-white text-lg flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                      <path d="M8 14h.01"></path>
                      <path d="M12 14h.01"></path>
                      <path d="M16 14h.01"></path>
                      <path d="M8 18h.01"></path>
                      <path d="M12 18h.01"></path>
                      <path d="M16 18h.01"></path>
                    </svg>
                    Attendance for {formatDate(targetDate)}
                  </h3>
                  <div className="flex space-x-3">
                    <button 
                      onClick={() => handleDateChange(1)} 
                      disabled={currentPage === 0}
                      className={`px-4 py-2 rounded-xl transition-all duration-200 flex items-center ${
                        currentPage === 0 
                          ? 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed' 
                          : 'bg-primary text-white hover:bg-blue-600 shadow-md hover:shadow-lg'
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6"></polyline>
                      </svg>
                      Previous
                    </button>
                    <button 
                      onClick={() => handleDateChange(-1)} 
                      disabled={currentPage === 0}
                      className={`px-4 py-2 rounded-xl transition-all duration-200 flex items-center ${
                        currentPage === 0 
                          ? 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed' 
                          : 'bg-primary text-white hover:bg-blue-600 shadow-md hover:shadow-lg'
                      }`}
                    >
                      Today
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6"></polyline>
                      </svg>
                    </button>
                  </div>
                </div>
                
                {attendance.length === 0 ? (
                  <div className="text-center py-20 text-gray-500 dark:text-gray-400 flex flex-col items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mb-6 text-gray-300 dark:text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                      <line x1="8" y1="21" x2="16" y2="21"></line>
                      <line x1="12" y1="17" x2="12" y2="21"></line>
                      <path d="M12 12h.01"></path>
                    </svg>
                    <p className="text-xl font-medium mb-2">No attendance records found</p>
                    <p className="text-sm max-w-md">There are no attendance records available for this date. Try selecting a different date or check back later.</p>
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-gray-700/70 text-gray-600 dark:text-gray-200">
                          <th className="py-4 px-6 font-semibold text-left">Employee</th>
                          <th className="py-4 px-6 font-semibold text-left">Check-In</th>
                          <th className="py-4 px-6 font-semibold text-left">Check-Out</th>
                          <th className="py-4 px-6 font-semibold text-left">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {attendance.map((record, i) => {
                          const emp = getEmployee(record);
                          return (
                            <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150">
                              <td className="flex items-center gap-3 px-6 py-4">
                                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 border-2 border-white dark:border-gray-700 shadow-sm">
                                  <img
                                    src={
                                      emp.image
                                        ? `${baseURL}${emp.image}`
                                        : `https://ui-avatars.com/api/?name=${emp.username || 'Unknown'}&background=209ACF&color=fff`
                                    }
                                    alt="avatar"
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div>
                                  <div className="font-medium text-gray-800 dark:text-white">
                                    {emp.username}
                                  </div>
                                  <div className="text-gray-400 text-xs">{record.deviceID || 'No device'}</div>
                                </div>
                              </td>
                              <td className="py-4 px-6 dark:text-white">
                                {formatTime(record.checkInTime) !== '-' ? (
                                  <div className="flex items-center">
                                    <span className={`w-2.5 h-2.5 rounded-full mr-2 ${record.isLate ? 'bg-amber-500' : 'bg-green-500'}`}></span>
                                    <span className={record.isLate ? 'text-amber-600 dark:text-amber-400 font-medium' : ''}>
                                      {formatTime(record.checkInTime)}
                                    </span>
                                    {record.isLate && (
                                      <span className="ml-2 text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full">Late</span>
                                    )}
                                  </div>
                                ) : '-'}
                              </td>
                              <td className="py-4 px-6 dark:text-white">
                                {formatTime(record.checkOutTime) !== '-' ? (
                                  <div className="flex items-center">
                                    <span className={`w-2.5 h-2.5 rounded-full mr-2 ${record.isEarly ? 'bg-amber-500' : 'bg-green-500'}`}></span>
                                    <span className={record.isEarly ? 'text-amber-600 dark:text-amber-400 font-medium' : ''}>
                                      {formatTime(record.checkOutTime)}
                                    </span>
                                    {record.isEarly && (
                                      <span className="ml-2 text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full">EarlyLeave</span>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-sm text-gray-500 dark:text-gray-500">-</span>
                                )}
                              </td>
                              <td className="py-4 px-6">
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  record.status === 'present' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 
                                  record.status === 'absent' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : 
                                  record.status === 'onLeave' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' : 
                                  'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                }`}>
                                  {record.status === 'onLeave' ? 'On Leave' : 
                                   record.status === 'partial' ? 'EarlyLeave' : 
                                   record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

const SummaryCard = ({ label, value, color, textColor, icon }) => (
  <div className={`bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-primary overflow-hidden relative ${color} group backdrop-blur-sm bg-opacity-90 dark:bg-opacity-90`}>
    <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-primary/10 dark:bg-primary/5 group-hover:bg-primary/20 transition-all duration-300"></div>
    <div className="absolute -bottom-8 -left-8 w-16 h-16 rounded-full bg-primary/5 dark:bg-primary/5 group-hover:bg-primary/10 transition-all duration-300"></div>
    <div className="relative z-10 flex justify-between items-start">
      <div>
        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{label}</p>
        <p className={`text-3xl font-bold mt-2 ${textColor}`}>{value}</p>
      </div>
      <div className="p-2.5 rounded-xl bg-white/90 dark:bg-gray-700/70 shadow-md">
        {icon}
      </div>
    </div>
  </div>
);

export default Dashboard;
