import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import DashboardLayout from '../Dashboard/DashboardLayout';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { 
  ChevronDownIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  ArrowDownTrayIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CalendarDaysIcon,
  ExclamationCircleIcon
} from '@heroicons/react/20/solid';
import { UserGroupIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { ThemeContext } from '../Context/ThemeContext';
const baseURL = process.env.REACT_APP_API_BASE;

const AttendanceManagement = () => {
  const [attendance, setAttendance] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { darkMode } = useContext(ThemeContext);

  useEffect(() => {
    fetchAttendance();
  }, [currentPage]);

  const fetchAttendance = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() - currentPage);
    
    // Format date as YYYY-MM-DD
    const selectedDateStr = targetDate.toISOString().split('T')[0];
    
    console.log(`Fetching attendance for date: ${selectedDateStr}`);

    try {
      const response = await axios.get(
        `${baseURL}api/attendance/date?date=${selectedDateStr}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Check if records exist in the response, regardless of success flag
      if (response.data && response.data.records && response.data.records.length > 0) {
        console.log(`Received ${response.data.records.length} attendance records`);
        setAttendance(response.data.records);
      } else if (response.data && response.data.data && response.data.data.length > 0) {
        console.log(`Received ${response.data.data.length} attendance records from data property`);
        setAttendance(response.data.data);
      } else {
        console.log('No attendance records found in response', response.data);
        setAttendance([]);
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch attendance:', error);
      console.error('Error details:', error.response?.data || error.message);
      setAttendance([]);
      setLoading(false);
    }
  };

  const getEmployee = (record) => {
    // If record already has username and image properties, use them directly
    if (record.username) {
      return {
        username: record.username || 'Unknown',
        image: record.image || null,
        deviceID: record.deviceID || 'N/A',
      };
    }
    
    // If record has employeeId object, extract from there
    if (record.employeeId) {
      return {
        username: record.employeeId.username || 'Unknown',
        image: record.employeeId.image || null,
        deviceID: record.employeeId.deviceID || record.deviceID || 'N/A',
      };
    }
    
    // Fallback to default values
    return {
      username: 'Unknown',
      image: null,
      deviceID: record.deviceID || 'N/A',
    };
  };

  const formatTime = (timeString) => {
    if (!timeString) return '-';
    return new Date(timeString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Africa/Nairobi'
    });
  };

  const calculateHours = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return '-';
    const total = new Date(checkOut) - new Date(checkIn);
    if (isNaN(total) || total <= 0) return '-';
    const h = Math.floor(total / 3600000);
    const m = Math.floor((total % 3600000) / 60000);
    return `${h}h ${m}m`;
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'present': 
        return 'bg-green-500 text-white dark:bg-green-600 dark:text-white border-0 px-3 py-1 rounded-full text-xs font-medium shadow-sm';
      case 'onLeave': 
        return 'bg-blue-500 text-white dark:bg-blue-600 dark:text-white border-0 px-3 py-1 rounded-full text-xs font-medium shadow-sm';
      case 'absent': 
        return 'bg-red-500 text-white dark:bg-red-600 dark:text-white border-0 px-3 py-1 rounded-full text-xs font-medium shadow-sm';
      case 'partial': 
      case 'leftEarly': 
        return 'bg-yellow-500 text-white dark:bg-yellow-600 dark:text-white border-0 px-3 py-1 rounded-full text-xs font-medium shadow-sm';
      default: 
        return 'bg-gray-500 text-white dark:bg-gray-600 dark:text-white border-0 px-3 py-1 rounded-full text-xs font-medium shadow-sm';
    }
  };

  const getPaginatedDate = () => {
    const today = new Date();
    today.setDate(today.getDate() - currentPage);
    return today.toISOString().split('T')[0];
  };

  const currentDate = getPaginatedDate();

  const exportToPDF = () => {
    const doc = new jsPDF();
    const columns = ["Employee", "Check-In", "Check-Out", "Late", "EarlyLeave", "Hours Worked", "Extra", "Status"];
    const rows = attendance.map(record => {
      const emp = getEmployee(record);
      return [
        emp.username || 'Unknown',
        formatTime(record.checkInTime),
        formatTime(record.checkOutTime),
        record.isLate ? 'Yes' : 'No',
        record.isEarly ? 'Yes' : 'No',
        calculateHours(record.checkInTime, record.checkOutTime),
        record.extraHours || '-',
        record.status,
      ];
    });
    autoTable(doc, {
      head: [columns],
      body: rows,
    });
    doc.save('Attendance.pdf');
  };

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Attendance");
  
    worksheet.columns = [
      { header: "Employee", key: "employee", width: 25 },
      { header: "Check-In", key: "checkIn", width: 15 },
      { header: "Check-Out", key: "checkOut", width: 15 },
      { header: "Late", key: "late", width: 10 },
      { header: "Early Leave", key: "early", width: 15 },
      { header: "Hours Worked", key: "hours", width: 20 },
      { header: "Extra", key: "extra", width: 10 },
      { header: "Status", key: "status", width: 15 },
    ];
  
    attendance.forEach((record) => {
      const emp = getEmployee(record);
      worksheet.addRow({
        employee: emp.username,
        checkIn: formatTime(record.checkInTime),
        checkOut: formatTime(record.checkOutTime),
        late: record.isLate ? 'Yes' : 'No',
        earlyLeave: record.isEarly ? 'Yes' : 'No',
        hours: calculateHours(record.checkInTime, record.checkOutTime),
        extra: record.extraHours || '-',
        status: record.status,
      });
    });
  
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), "Attendance.xlsx");
  };

  return (
    <DashboardLayout>
      <div className="p-6 bg-white dark:bg-gray-800 min-h-screen">
        {/* Header Section */}
        <div className="mb-6 flex justify-between items-start">
          <div>
            <div className="flex items-center space-x-3">
              <div className="bg-primary p-2 rounded-lg">
                <UserGroupIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Attendance Management</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Monitor and manage employee attendance records</p>
              </div>
            </div>
            
            {/* Date display below the title */}
            <div className="mt-3 flex items-center text-gray-700 dark:text-gray-300">
              <CalendarIcon className="h-5 w-5 mr-2 text-primary dark:text-primary" />
              <span className="text-lg font-medium">
                {format(new Date(getPaginatedDate()), 'EEEE, MMMM d, yyyy')}
              </span>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-2 bg-primary hover:bg-primary text-white px-4 py-2 rounded-lg transition-colors"
              >
                <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                <span>Export</span>
                <ChevronDownIcon className="h-5 w-5" />
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md z-10 border border-gray-200 dark:border-gray-700 animate-fade-in-down">
                  <ul className="py-1">
                    <li>
                      <button
                        onClick={() => {
                          exportToPDF();
                          setDropdownOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Export as PDF
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => {
                          exportToExcel();
                          setDropdownOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Export as Excel
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Date Navigation - Simplified with < > buttons */}
        <div className="flex justify-end mb-4">
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
              className="flex items-center justify-center w-9 h-9 text-gray-600 dark:text-gray-300 rounded-l-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:hover:bg-transparent"
              disabled={currentPage === 0}
              title="Previous Day"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => setCurrentPage((prev) => prev + 1)}
              className="flex items-center justify-center w-9 h-9 text-gray-600 dark:text-gray-300 rounded-r-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title="Next Day"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Attendance Table - Simplified design */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <table className="min-w-full bg-white dark:bg-gray-800">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-700 text-left">
                  <th scope="col" className="px-6 py-3 text-sm font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Employee
                  </th>
                  <th scope="col" className="px-6 py-3 text-sm font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Check-In
                  </th>
                  <th scope="col" className="px-6 py-3 text-sm font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Check-Out
                  </th>
                  <th scope="col" className="px-6 py-3 text-sm font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Late
                  </th>
                  <th scope="col" className="px-6 py-3 text-sm font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Early Leave
                  </th>
                  <th scope="col" className="px-6 py-3 text-sm font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Hours Worked
                  </th>
                  <th scope="col" className="px-6 py-3 text-sm font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Extra
                  </th>
                  <th scope="col" className="px-6 py-3 text-sm font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {attendance.length > 0 ? (
                  attendance.map((record, index) => {
                    const emp = getEmployee(record);
                    return (
                      <tr 
                        key={record.id || index} 
                        className={`${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-750'} hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 relative">
                              <img
                                src={emp.image ? `${baseURL}${emp.image}` : `https://ui-avatars.com/api/?name=${emp.username || 'Unknown'}&background=random`}
                                className="h-10 w-10 rounded-full object-cover"
                                alt="avatar"
                              />
                              <div className={`absolute bottom-0 right-0 h-3 w-3 rounded-full ${
                                record.status === 'present' ? 'bg-green-500' : 
                                record.status === 'absent' ? 'bg-red-500' : 
                                record.status === 'onLeave' ? 'bg-blue-500' : 'bg-yellow-500'
                              }`}></div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">{emp.username}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">{emp.deviceID}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {record.checkInTime ? (
                            <div className="flex items-center">
                              <span className={`w-2 h-2 rounded-full mr-2 ${record.isLate ? 'bg-amber-500' : 'bg-green-500'}`}></span>
                              <span className={`text-sm ${record.isLate ? 'text-amber-600 dark:text-amber-400 font-medium' : 'text-gray-700 dark:text-gray-300'}`}>
                                {formatTime(record.checkInTime)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500 dark:text-gray-500">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {record.checkOutTime ? (
                            <div className="flex items-center">
                              <span className={`w-2 h-2 rounded-full mr-2 ${record.earlyLeave ? 'bg-amber-500' : 'bg-green-500'}`}></span>
                              <span className={`text-sm ${record.isEarly ? 'text-amber-600 dark:text-amber-400 font-medium' : 'text-gray-700 dark:text-gray-300'}`}>
                                {formatTime(record.checkOutTime)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500 dark:text-gray-500">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {record.checkInTime ? (record.isLate ? 'Yes' : 'No') : '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {record.checkOutTime ? (record.isEarly ? 'Yes' : 'No') : '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {calculateHours(record.checkInTime, record.checkOutTime)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {record.extraHours || '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className={getStatusClass(record.status)}>
                            {record.status === 'onLeave' ? 'On Leave' : 
                             record.status === 'partial' ? 'EarlyLeave' : 
                             record.status === 'leftEarly' ? 'EarlyLeave' : 
                             record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="8" className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center">
                        <p className="text-gray-500 dark:text-gray-400 text-lg">No attendance records found for this date</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AttendanceManagement;
