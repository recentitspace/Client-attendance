import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import DashboardLayout from '../Dashboard/DashboardLayout';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
const baseURL = process.env.REACT_APP_API_BASE;

const AttendanceManagement = () => {
  const [attendance, setAttendance] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    fetchAttendance();
  }, [currentPage]);

  const fetchAttendance = async () => {
    const token = localStorage.getItem('token');
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() - currentPage);
    const selectedDateStr = targetDate.toISOString().split('T')[0];

    try {
      const response = await axios.get(
        `${baseURL}api/attendance/date?date=${selectedDateStr}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setAttendance(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch attendance:', error);
    }
  };

  const getEmployee = (record) => {
    return {
      username: record.username || 'Unknown',
      image: record.image || null,
      deviceID: record.deviceID,
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
      case 'present': return 'bg-green-100 text-green-600 dark:bg-green-700 dark:text-green-200';
      case 'onLeave': return 'bg-blue-100 text-blue-600 dark:bg-blue-700 dark:text-blue-200';
      case 'absent': return 'bg-red-100 text-red-600 dark:bg-red-700 dark:text-red-200';
      case 'partial': return 'bg-yellow-100 text-yellow-600 dark:bg-yellow-700 dark:text-yellow-200';
      case 'shiftNotStarted': return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300';
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
    const columns = ["Employee", "Check-In", "Check-Out", "Late", "Early Leave", "Hours Worked", "Extra", "Status"];
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
        early: record.isEarly ? 'Yes' : 'No',
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
      <div className="p-6 text-gray-800 dark:text-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Attendance</h2>
          <div className="flex gap-2">
          <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="bg-blue-600 text-white px-4 py-2 rounded inline-flex items-center"
                >
                  Export
                  <ChevronDownIcon className="w-4 h-4 ml-2" />
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-700 rounded shadow-lg z-50">
                    <button
                      onClick={() => {
                        exportToPDF();
                        setDropdownOpen(false);
                      }}
                      className="block px-4 py-2 text-sm text-left text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 w-full"
                    >
                      Export as PDF
                    </button>
                    <button
                      onClick={() => {
                        exportToExcel();
                        setDropdownOpen(false);
                      }}
                      className="block px-4 py-2 text-sm text-left text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 w-full"
                    >
                      Export as Excel
                    </button>
                  </div>
                )}
              </div>


            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white rounded disabled:opacity-50"
              disabled={currentPage === 0}
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage((prev) => prev + 1)}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white rounded"
            >
              Next
            </button>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">
            {format(new Date(currentDate), 'MMMM d, yyyy')}
          </h3>

          <div className="overflow-x-auto rounded-xl shadow bg-white dark:bg-gray-900">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                <tr>
                  <th className="px-6 py-3">Employee</th>
                  <th className="px-6 py-3">Check-In</th>
                  <th className="px-6 py-3">Check-Out</th>
                  <th className="px-6 py-3">Late</th>
                  <th className="px-6 py-3">Early Leave</th>
                  <th className="px-6 py-3">Hours Worked</th>
                  <th className="px-6 py-3">Extra</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {attendance.length > 0 ? (
                  attendance.map((record) => {
                    const emp = getEmployee(record);
                    return (
                      <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="flex items-center gap-3 px-6 py-4 whitespace-nowrap">
                          <img
                            src={emp.image ? `${baseURL}${emp.image}` : `https://ui-avatars.com/api/?name=${emp.username || 'Unknown'}`}
                            className="w-10 h-10 rounded-full object-cover"
                            alt="avatar"
                          />
                          <div>
                            <div className="font-medium">{emp.username || 'Unknown'}</div>
                            <div className="text-xs text-gray-400">{record.deviceID}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">{formatTime(record.checkInTime)}</td>
                        <td className="px-6 py-4">{formatTime(record.checkOutTime)}</td>
                        <td className="px-6 py-4">{record.checkInTime ? (record.isLate ? 'Yes' : 'No') : '-'}</td>
                        <td className="px-6 py-4">{record.checkOutTime ? (record.isEarly ? 'Yes' : 'No') : '-'}</td>
                        <td className="px-6 py-4">{calculateHours(record.checkInTime, record.checkOutTime)}</td>
                        <td className="px-6 py-4">{record.extraHours || '-'}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusClass(record.status)}`}>
                            {record.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center py-10 text-gray-400 dark:text-gray-500">
                      No attendance records found for this date.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AttendanceManagement;
