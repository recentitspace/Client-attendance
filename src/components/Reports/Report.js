import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { CSVLink } from 'react-csv';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format, parseISO, differenceInDays } from 'date-fns';
import DashboardLayout from '../Dashboard/DashboardLayout';
import * as XLSX from 'xlsx';
import {
  ChartBarIcon,
  CalendarDaysIcon,
  UserIcon,
  DocumentTextIcon,
  ArrowDownTrayIcon,
  ChevronDownIcon,
  XMarkIcon,
  FunnelIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowRightIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
const baseURL = process.env.REACT_APP_API_BASE;

const ReportsPage = () => {
  const [summary, setSummary] = useState(null);
  const [records, setRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [loading, setLoading] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const exportDropdownRef = useRef(null);
  const filterPanelRef = useRef(null);

  // Calculate report statistics
  const reportStats = React.useMemo(() => {
    if (!records.length) return null;
    
    const totalDays = records.length;
    const presentDays = records.filter(r => r.status === 'present').length;
    const absentDays = records.filter(r => r.status === 'absent').length;
    const leaveDays = records.filter(r => r.status === 'onLeave').length;
    const totalHours = records.reduce((sum, r) => sum + (r.hoursWorked || 0), 0);
    const totalExtraHours = records.reduce((sum, r) => sum + (r.extraHours || 0), 0);
    const averageHours = totalDays ? (totalHours / totalDays).toFixed(1) : 0;
    
    return {
      totalDays,
      presentDays,
      absentDays,
      leaveDays,
      totalHours,
      totalExtraHours,
      averageHours,
      attendanceRate: totalDays ? ((presentDays / totalDays) * 100).toFixed(1) : 0
    };
  }, [records]);

  const fetchSummary = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${baseURL}api/reports/summary`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSummary(res.data);
    } catch (error) {
      console.error('Summary error:', error);
    }
  };

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${baseURL}api/employees`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmployees(res.data);
    } catch (err) {
      console.error('Error fetching employees:', err);
    }
  };

  const fetchEmployeeReport = async () => {
    if (!selectedEmployee || !dateRange.from || !dateRange.to) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(
        `${baseURL}api/reports/range/${selectedEmployee}?from=${dateRange.from}&to=${dateRange.to}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRecords(res.data.data);
      setShowFilters(false);
    } catch (err) {
      console.error('Employee report error:', err);
    }
    setLoading(false);
  };

  const exportPDF = async () => {
    setExportLoading(true);
    try {
      const doc = new jsPDF();
      const employeeName = employees.find(emp => emp._id === selectedEmployee)?.username || 'All Employees';
      const dateFrom = format(parseISO(dateRange.from), 'MMM dd, yyyy');
      const dateTo = format(parseISO(dateRange.to), 'MMM dd, yyyy');
      const totalDays = differenceInDays(parseISO(dateRange.to), parseISO(dateRange.from)) + 1;
      
      // Add header
      doc.setFontSize(20);
      doc.setTextColor(32, 154, 207); // Primary color
      doc.text('Attendance Report', 14, 20);
      
      // Add report info
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Employee: ${employeeName}`, 14, 30);
      doc.text(`Period: ${dateFrom} to ${dateTo} (${totalDays} days)`, 14, 35);
      doc.text(`Generated on: ${format(new Date(), 'MMM dd, yyyy, hh:mm a')}`, 14, 40);
      
      // Add statistics
      if (reportStats) {
        doc.setFillColor(245, 247, 250);
        doc.rect(14, 45, 180, 25, 'F');
        doc.setFontSize(9);
        doc.setTextColor(70, 70, 70);
        
        doc.text(`Present: ${reportStats.presentDays} days`, 20, 52);
        doc.text(`Absent: ${reportStats.absentDays} days`, 70, 52);
        doc.text(`Leave: ${reportStats.leaveDays} days`, 120, 52);
        doc.text(`Attendance Rate: ${reportStats.attendanceRate}%`, 170, 52);
        
        doc.text(`Total Hours: ${reportStats.totalHours} h`, 20, 62);
        doc.text(`Extra Hours: ${reportStats.totalExtraHours} h`, 70, 62);
        doc.text(`Average Hours/Day: ${reportStats.averageHours} h`, 120, 62);
      }
      
      // Add table
      autoTable(doc, {
        startY: 75,
        head: [['Date', 'Status', 'Check-In', 'Check-Out', 'Hours', 'Extra', 'Late', 'EarlyLeave']],
        body: records.map(r => [
          format(new Date(r.date), 'MMM dd, yyyy'),
          r.status,
          r.checkInTime ? format(new Date(r.checkInTime), 'hh:mm a') : '-',
          r.checkOutTime ? format(new Date(r.checkOutTime), 'hh:mm a') : '-',
          `${r.hoursWorked || 0} h`,
          `${r.extraHours || 0} h`,
          r.isLate ? 'Yes' : 'No',
          r.isEarly ? 'Yes' : 'No'
        ]),
        styles: { fontSize: 9 },
        headStyles: { fillColor: [32, 154, 207], textColor: [255, 255, 255] },
        alternateRowStyles: { fillColor: [245, 247, 250] },
        columnStyles: {
          0: { cellWidth: 30 },
          1: { cellWidth: 25 },
          2: { cellWidth: 30 },
          3: { cellWidth: 30 },
          4: { cellWidth: 20 },
          5: { cellWidth: 20 },
          6: { cellWidth: 20 },
          7: { cellWidth: 20 }
        }
      });
      
      // Add footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`Page ${i} of ${pageCount} - Attendo Attendance System`, doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 10, { align: 'center' });
      }
      
      doc.save(`Attendance_Report_${employeeName}_${dateRange.from}_to_${dateRange.to}.pdf`);
    } catch (error) {
      console.error('Error exporting PDF:', error);
    } finally {
      setExportLoading(false);
      setShowExportOptions(false);
    }
  };

  const exportToExcel = async () => {
    setExportLoading(true);
    try {
      const employeeName = employees.find(emp => emp._id === selectedEmployee)?.username || 'All-Employees';
      
      // Create worksheet
      const worksheet = XLSX.utils.json_to_sheet(
        records.map((r) => ({
          Date: format(new Date(r.date), 'MMM dd, yyyy'),
          Status: r.status,
          'Check-In': r.checkInTime ? format(new Date(r.checkInTime), 'hh:mm a') : '-',
          'Check-Out': r.checkOutTime ? format(new Date(r.checkOutTime), 'hh:mm a') : '-',
          'Hours Worked': `${r.hoursWorked || 0}`,
          'Extra Hours': `${r.extraHours || 0}`,
          'Late': r.isLate ? 'Yes' : 'No',
          'EarlyLeave': r.isEarly ? 'Yes' : 'No'
        }))
      );
      
      // Add header with report information
      XLSX.utils.sheet_add_aoa(worksheet, [
        ['Attendance Report'],
        [`Employee: ${employeeName}`],
        [`Period: ${format(parseISO(dateRange.from), 'MMM dd, yyyy')} to ${format(parseISO(dateRange.to), 'MMM dd, yyyy')}`],
        [`Generated on: ${format(new Date(), 'MMM dd, yyyy, hh:mm a')}`],
        [''] // Empty row before data
      ], { origin: 'A1' });
      
      // Add statistics if available
      if (reportStats) {
        XLSX.utils.sheet_add_aoa(worksheet, [
          ['Attendance Statistics'],
          [`Present Days: ${reportStats.presentDays}`, `Absent Days: ${reportStats.absentDays}`, `Leave Days: ${reportStats.leaveDays}`, `Attendance Rate: ${reportStats.attendanceRate}%`],
          [`Total Hours: ${reportStats.totalHours}`, `Extra Hours: ${reportStats.totalExtraHours}`, `Average Hours/Day: ${reportStats.averageHours}`],
          [''] // Empty row before data
        ], { origin: 'A6' });
      }
      
      // Set column widths
      const wscols = [
        { wch: 15 }, // Date
        { wch: 10 }, // Status
        { wch: 12 }, // Check-In
        { wch: 12 }, // Check-Out
        { wch: 12 }, // Hours
        { wch: 12 }  // Extra
      ];
      worksheet['!cols'] = wscols;
      
      // Create workbook and add worksheet
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance Report');
      
      // Write file
      XLSX.writeFile(workbook, `Attendance_Report_${employeeName}_${dateRange.from}_to_${dateRange.to}.xlsx`);
    } catch (error) {
      console.error('Error exporting Excel:', error);
    } finally {
      setExportLoading(false);
      setShowExportOptions(false);
    }
  };

  const exportToCSV = () => {
    const employeeName = employees.find(emp => emp._id === selectedEmployee)?.username || 'All-Employees';
    const csvData = records.map((r) => ({
      Date: format(new Date(r.date), 'yyyy-MM-dd'),
      Status: r.status,
      'Check-In': r.checkInTime ? format(new Date(r.checkInTime), 'HH:mm:ss') : '-',
      'Check-Out': r.checkOutTime ? format(new Date(r.checkOutTime), 'HH:mm:ss') : '-',
      'Hours Worked': r.hoursWorked || 0,
      'Extra Hours': r.extraHours || 0,
    }));
    
    const csvHeaders = [
      { label: "Date", key: "Date" },
      { label: "Status", key: "Status" },
      { label: "Check-In", key: "Check-In" },
      { label: "Check-Out", key: "Check-Out" },
      { label: "Hours Worked", key: "Hours Worked" },
      { label: "Extra Hours", key: "Extra Hours" }
    ];
    
    return (
      <CSVLink 
        data={csvData} 
        headers={csvHeaders} 
        filename={`Attendance_Report_${employeeName}_${dateRange.from}_to_${dateRange.to}.csv`}
        className="flex items-center w-full px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
        onClick={() => setShowExportOptions(false)}
      >
        <DocumentTextIcon className="h-5 w-5 mr-2" />
        CSV
      </CSVLink>
    );
  };

  // Handle clicks outside the export dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target)) {
        setShowExportOptions(false);
      }
      if (filterPanelRef.current && !filterPanelRef.current.contains(event.target) && 
          !event.target.closest('[data-filter-toggle]')) {
        setShowFilters(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    fetchSummary();
    fetchEmployees();
  }, []);

  return (
    <DashboardLayout>
      <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-primary p-2 rounded-lg">
              <ChartBarIcon className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Attendance Reports</h1>
          </div>
          <p className="text-gray-500 dark:text-gray-400 ml-11">Generate and analyze employee attendance data</p>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <SummaryCard 
              title="Present" 
              value={summary.present} 
              icon={<UserIcon className="h-5 w-5" />}
              color="bg-green-500"
            />
            <SummaryCard 
              title="Absent" 
              value={summary.absent} 
              icon={<XMarkIcon className="h-5 w-5" />}
              color="bg-red-500"
            />
            <SummaryCard 
              title="On Leave" 
              value={summary.onLeave} 
              icon={<CalendarDaysIcon className="h-5 w-5" />}
              color="bg-yellow-500"
            />
            <SummaryCard 
              title="Partial" 
              value={summary.partial} 
              icon={<ClockIcon className="h-5 w-5" />}
              color="bg-blue-500"
            />
          </div>
        )}

        {/* Main Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          {/* Report Controls */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-wrap justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
              Employee Attendance Report
            </h2>
            
            <div className="flex space-x-2">
              <button
                data-filter-toggle
                onClick={() => setShowFilters(!showFilters)}
                className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg flex items-center transition-colors"
              >
                <FunnelIcon className="h-4 w-4 mr-2" />
                Filters
              </button>
              
              {records.length > 0 && (
                <div ref={exportDropdownRef} className="relative">
                  <button 
                    onClick={() => setShowExportOptions(!showExportOptions)}
                    disabled={exportLoading}
                    className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg flex items-center transition-colors disabled:opacity-70"
                  >
                    {exportLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Exporting...
                      </>
                    ) : (
                      <>
                        <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                        Export
                        <ChevronDownIcon className="h-4 w-4 ml-1" />
                      </>
                    )}
                  </button>
                  
                  {showExportOptions && (
                    <div className="absolute right-0 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden z-10 w-40 border border-gray-200 dark:border-gray-700">
                      <button 
                        onClick={exportToExcel} 
                        className="flex items-center w-full px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <DocumentTextIcon className="h-5 w-5 mr-2" />
                        Excel
                      </button>
                      <button 
                        onClick={exportPDF} 
                        className="flex items-center w-full px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                        PDF
                      </button>
                      {exportToCSV()}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div ref={filterPanelRef} className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <select
                  className="border rounded px-3 py-2 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                >
                  <option value="">Select Employee</option>
                  {employees.map((emp) => (
                    <option key={emp._id} value={emp._id}>{emp.username}</option>
                  ))}
                </select>
                <input
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                  className="border rounded px-3 py-2 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <input
                  type="date"
                  value={dateRange.to}
                  onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                  className="border rounded px-3 py-2 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <div className="flex items-center gap-2">
                  <button
                    onClick={fetchEmployeeReport}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                  >
                    Filter
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Report Table */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
              <p className="ml-4 text-gray-500 dark:text-gray-400 font-medium">Loading report data...</p>
            </div>
          ) : records.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-700 text-left">
                    <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-200 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">
                      <div className="flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        Date
                      </div>
                    </th>
                    <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-200 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">
                      <div className="flex items-center">
                        <UserIcon className="h-4 w-4 mr-2" />
                        Status
                      </div>
                    </th>
                    <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-200 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">
                      <div className="flex items-center">
                        <ArrowRightIcon className="h-4 w-4 mr-2" />
                        Check-In
                      </div>
                    </th>
                    <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-200 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">
                      <div className="flex items-center">
                        <ArrowRightIcon className="h-4 w-4 mr-2 rotate-180" />
                        Check-Out
                      </div>
                    </th>
                    <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-200 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">
                      <div className="flex items-center">
                        <ClockIcon className="h-4 w-4 mr-2" />
                        Hours
                      </div>
                    </th>
                    <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-200 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">
                      <div className="flex items-center">
                        <ClockIcon className="h-4 w-4 mr-2" />
                        Extra
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((r, idx) => (
                    <tr 
                      key={idx} 
                      className={`border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${idx % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-800/50'}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
                          {format(new Date(r.date), 'MMM dd, yyyy')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          r.status === 'present' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 
                          r.status === 'absent' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : 
                          r.status === 'onLeave' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                          r.status === 'partial' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}>
                          {r.status === 'present' && <CheckCircleIcon className="h-3.5 w-3.5 mr-1" />}
                          {r.status === 'absent' && <XMarkIcon className="h-3.5 w-3.5 mr-1" />}
                          {r.status === 'onLeave' && <CalendarDaysIcon className="h-3.5 w-3.5 mr-1" />}
                          {r.status === 'partial' && <ExclamationCircleIcon className="h-3.5 w-3.5 mr-1" />}
                          {r.status === 'onLeave' ? 'On Leave' : 
                           r.status === 'partial' ? 'EarlyLeave' : 
                           r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {r.checkInTime ? (
                          <div className="flex items-center">
                            <ClockIcon className="h-4 w-4 mr-2 text-green-500" />
                            {format(new Date(r.checkInTime), 'hh:mm a')}
                          </div>
                        ) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {r.checkOutTime ? (
                          <div className="flex items-center">
                            <ClockIcon className="h-4 w-4 mr-2 text-red-500" />
                            {format(new Date(r.checkOutTime), 'hh:mm a')}
                          </div>
                        ) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium">
                        <div className="flex items-center">
                          <ClockIcon className="h-4 w-4 mr-2 text-gray-400" />
                          {r.hoursWorked || 0} h
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium">
                        <div className="flex items-center">
                          <ClockIcon className="h-4 w-4 mr-2 text-blue-500" />
                          {r.extraHours || 0} h
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16">
              <svg className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              <p className="text-gray-500 dark:text-gray-400 text-lg">No records found</p>
              <p className="text-gray-400 dark:text-gray-500 mt-1">Try adjusting your filters to see more results</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

// Add the SummaryCard component definition
const SummaryCard = ({ title, value, icon, color }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
    <div className="flex items-center">
      <div className={`${color} p-2 rounded-lg mr-3`}>
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
        <p className="text-2xl font-bold text-gray-800 dark:text-white">{value}</p>
      </div>
    </div>
  </div>
);

export default ReportsPage;
