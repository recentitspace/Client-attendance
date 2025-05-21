import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import DashboardLayout from '../Dashboard/DashboardLayout';
import { ChevronLeftIcon, ChevronRightIcon, CalendarIcon, CheckIcon, XMarkIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
const baseURL = process.env.REACT_APP_API_BASE;

const LeaveRequests = () => {
  const [requests, setRequests] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    fetchLeaveRequests();
  }, [currentPage]);

  const fetchLeaveRequests = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get(`${baseURL}api/leave-requests/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() - currentPage);
      const todayStr = targetDate.toISOString().split('T')[0];

      // Filter requests where the current date falls within the leave period
      const filtered = res.data.filter((req) => {
        const startDate = new Date(req.startDate).toISOString().split('T')[0];
        const endDate = new Date(req.endDate).toISOString().split('T')[0];
        
        // Check if today is within the leave period (inclusive of start and end dates)
        return todayStr >= startDate && todayStr <= endDate;
      });

      setRequests(filtered);
      setLeaveRequests(filtered);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch leave requests:', err);
      setLoading(false);
    }
  };

  const currentDate = (() => {
    const today = new Date();
    today.setDate(today.getDate() - currentPage);
    return today.toISOString().split('T')[0];
  })();

  const handleUpdateStatus = async (id, newStatus) => {
    const token = localStorage.getItem('token');
    try {
      await axios.put(
        `${baseURL}api/leave-requests/update/${id}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchLeaveRequests();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  useEffect(() => {
    const filtered = statusFilter
      ? leaveRequests.filter((req) => req.status === statusFilter)
      : leaveRequests;
    setFilteredRequests(filtered);
  }, [statusFilter, leaveRequests]);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/30';
      case 'rejected':
        return 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/30';
      default:
        return 'bg-yellow-50 text-yellow-700 border border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800/30';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckIcon className="h-3 w-3 mr-1" />;
      case 'rejected':
        return <XMarkIcon className="h-3 w-3 mr-1" />;
      default:
        return null;
    }
  };

  // Export to PDF function
  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(16);
    doc.text('Leave Requests Report', 14, 15);
    
    // Add date
    doc.setFontSize(10);
    doc.text(`Date: ${format(new Date(currentDate), 'MMMM d, yyyy')}`, 14, 22);
    
    // Define the table columns and rows
    const tableColumn = ["Employee", "Leave Period", "Type", "Status"];
    const tableRows = filteredRequests.map(record => [
      record.employeeId?.username || 'Unknown',
      `${format(new Date(record.startDate), 'MMM d, yyyy')} to ${format(new Date(record.endDate), 'MMM d, yyyy')}`,
      record.type,
      record.status
    ]);
    
    // Generate the table
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [33, 150, 243] }
    });
    
    // Save the PDF
    doc.save(`Leave_Requests_${format(new Date(currentDate), 'yyyy-MM-dd')}.pdf`);
    setDropdownOpen(false);
  };

  // Export to Excel function
  const exportToExcel = () => {
    // Prepare data for Excel
    const excelData = filteredRequests.map(record => ({
      'Employee': record.employeeId?.username || 'Unknown',
      'Employee ID': record.deviceID || 'N/A',
      'Start Date': format(new Date(record.startDate), 'MMM d, yyyy'),
      'End Date': format(new Date(record.endDate), 'MMM d, yyyy'),
      'Type': record.type,
      'Status': record.status,
      'Request Date': format(new Date(record.requestDate), 'MMM d, yyyy')
    }));
    
    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Leave Requests");
    
    // Generate Excel file
    XLSX.writeFile(workbook, `Leave_Requests_${format(new Date(currentDate), 'yyyy-MM-dd')}.xlsx`);
    setDropdownOpen(false);
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Leave Requests</h2>
                <div className="flex items-center mt-2 text-gray-500 dark:text-gray-400">
                  <CalendarIcon className="h-4 w-4 mr-1" />
                  <span className="text-sm font-medium">
                    {format(new Date(currentDate), 'MMMM d, yyyy')}
                  </span>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <select
                  className="bg-white text-gray-700 px-4 py-2 rounded-lg border border-gray-300 
                            dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All Requests</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>

                {filteredRequests.length > 0 && (
                  <div className="relative">
                    <button
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg inline-flex items-center"
                    >
                      <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                      Export
                      <ChevronDownIcon className="w-4 h-4 ml-2" />
                    </button>
                    {dropdownOpen && (
                      <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-700 rounded-lg shadow-lg z-50 border border-gray-200 dark:border-gray-600 overflow-hidden">
                        <button
                          onClick={exportToPDF}
                          className="block w-full px-4 py-2 text-sm text-left text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600"
                        >
                          Export as PDF
                        </button>
                        <button
                          onClick={exportToExcel}
                          className="block w-full px-4 py-2 text-sm text-left text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600"
                        >
                          Export as Excel
                        </button>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
                    className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 text-gray-700 
                              dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 
                              disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    disabled={currentPage === 0}
                  >
                    <ChevronLeftIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                    className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 text-gray-700 
                              dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 
                              transition-colors"
                  >
                    <ChevronRightIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-6">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Employee
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Leave Period
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Reason
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredRequests.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">
                          <div className="flex flex-col items-center">
                            <CalendarIcon className="h-10 w-10 text-gray-400 dark:text-gray-600 mb-2" />
                            <p className="text-sm">No leave requests found for this date.</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredRequests.map((record) => (
                        <tr key={record._id} className="hover:bg-gray-50 dark:hover:bg-gray-750 even:bg-gray-50 dark:even:bg-gray-700/50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <img
                                src={
                                  record.employeeId?.image
                                    ? `${baseURL}${record.employeeId.image}`
                                    : `https://ui-avatars.com/api/?name=${record.employeeId?.username || 'User'}&background=209ACF&color=fff`
                                }
                                className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                                alt="avatar"
                              />
                              <div>
                                <div className="font-medium text-gray-800 dark:text-white">
                                  {record.employeeId?.username || 'Unknown'}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">{record.deviceID || 'No device'}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-800 dark:text-gray-200">
                              {format(new Date(record.startDate), 'MMM d, yyyy')}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              to {format(new Date(record.endDate), 'MMM d, yyyy')}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-3 py-1 inline-flex text-sm leading-5 font-medium rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
                              {record.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${getStatusBadgeClass(record.status)}`}>
                              {getStatusIcon(record.status)}
                              {record.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            {record.status === 'pending' && (
                              <div className="flex gap-2 justify-end">
                                <button
                                  onClick={() => handleUpdateStatus(record._id, 'approved')}
                                  className="inline-flex items-center px-3 py-1 border border-transparent text-xs leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                                >
                                  <CheckIcon className="h-3 w-3 mr-1" />
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleUpdateStatus(record._id, 'rejected')}
                                  className="inline-flex items-center px-3 py-1 border border-transparent text-xs leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                                >
                                  <XMarkIcon className="h-3 w-3 mr-1" />
                                  Reject
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LeaveRequests;
