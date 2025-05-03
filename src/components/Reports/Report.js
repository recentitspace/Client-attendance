import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { CSVLink } from 'react-csv';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import DashboardLayout from '../Dashboard/DashboardLayout';
import * as XLSX from 'xlsx';
const ReportsPage = () => {
  const [summary, setSummary] = useState(null);
  const [records, setRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [loading, setLoading] = useState(false);

  const fetchSummary = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/reports/summary', {
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
      const res = await axios.get('http://localhost:5000/api/employees', {
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
        `http://localhost:5000/api/reports/range/${selectedEmployee}?from=${dateRange.from}&to=${dateRange.to}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRecords(res.data.data);
    } catch (err) {
      console.error('Employee report error:', err);
    }
    setLoading(false);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text('Attendance Report', 14, 10);
    autoTable(doc, {
      startY: 20,
      head: [['Date', 'Status', 'Check-In', 'Check-Out', 'Hours', 'Extra']],
      body: records.map(r => [
        format(new Date(r.date), 'MMM dd, yyyy'),
        r.status,
        r.checkInTime ? format(new Date(r.checkInTime), 'hh:mm a') : '-',
        r.checkOutTime ? format(new Date(r.checkOutTime), 'hh:mm a') : '-',
        `${r.hoursWorked || 0} h`,
        `${r.extraHours || 0} h`
      ])
    });
    doc.save('attendance-report.pdf');
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      records.map((r) => ({
        Date: format(new Date(r.date), 'PPP'),
        Status: r.status,
        'Check-In': r.checkInTime ? format(new Date(r.checkInTime), 'p') : '-',
        'Check-Out': r.checkOutTime ? format(new Date(r.checkOutTime), 'p') : '-',
        Hours: `${r.hoursWorked || 0} h`,
        Extra: `${r.extraHours || 0} h`,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
    XLSX.writeFile(workbook, 'attendance_report.xlsx');
  };

  useEffect(() => {
    fetchSummary();
    fetchEmployees();
  }, []);

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 bg-gray-100 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-100">
        <h2 className="text-2xl font-semibold">Reports</h2>

        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['present', 'absent', 'onLeave', 'partial'].map(key => (
              <div key={key} className="bg-white dark:bg-gray-800 p-4 rounded shadow text-center">
                <p className="text-gray-500 dark:text-gray-400 capitalize">{key}</p>
                <p className="text-xl font-bold">{summary[key]}</p>
              </div>
            ))}
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow space-y-4">
          <h3 className="text-lg font-semibold">Filter by Employee & Date</h3>
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
              {records.length > 0 && (
                <div className="relative">
                  <button className="bg-gray-700 text-white px-4 py-2 rounded">Export</button>
                  <div className="absolute bg-white dark:bg-gray-800 mt-1 shadow rounded overflow-hidden z-10">
                    <button onClick={exportToExcel}  className="block px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-700">
                      Excel
                    </button>
                    <button onClick={exportPDF} className="block w-full text-left px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-700">
                      PDF
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <p className="text-center text-gray-500 dark:text-gray-400">Loading...</p>
        ) : records.length > 0 ? (
          <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded shadow mt-4">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 dark:bg-gray-700 text-left">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Check-In</th>
                  <th className="px-4 py-3">Check-Out</th>
                  <th className="px-4 py-3">Hours</th>
                  <th className="px-4 py-3">Extra</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r, idx) => (
                  <tr key={idx} className="border-t hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-2">{format(new Date(r.date), 'MMM dd, yyyy')}</td>
                    <td className="px-4 py-2 capitalize">{r.status}</td>
                    <td className="px-4 py-2">{r.checkInTime ? format(new Date(r.checkInTime), 'hh:mm a') : '-'}</td>
                    <td className="px-4 py-2">{r.checkOutTime ? format(new Date(r.checkOutTime), 'hh:mm a') : '-'}</td>
                    <td className="px-4 py-2">{r.hoursWorked || 0} h</td>
                    <td className="px-4 py-2">{r.extraHours || 0} h</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400">No records found.</p>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ReportsPage;
