import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import DashboardLayout from '../Dashboard/DashboardLayout';
const baseURL = process.env.REACT_APP_API_BASE;

const LeaveRequests = () => {
  const [requests, setRequests] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);

  useEffect(() => {
    fetchLeaveRequests();
  }, [currentPage]);

  const fetchLeaveRequests = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get(`${baseURL}api/leave-requests/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() - currentPage);
      const todayStr = targetDate.toISOString().split('T')[0];

      const filtered = res.data.filter((req) => {
        const requestDate = new Date(req.requestDate).toISOString().split('T')[0];
        return requestDate === todayStr;
      });

      setRequests(filtered);
      setLeaveRequests(filtered); // ✅ Fix: Set data used for filtering
    } catch (err) {
      console.error('Failed to fetch leave requests:', err);
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

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Leave Requests</h2>
          <div className="flex gap-2">
            <select
              className="bg-white text-gray-900 p-2 rounded border border-gray-300 
                         dark:bg-gray-800 dark:text-white dark:border-gray-600"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>

            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 dark:text-white rounded disabled:opacity-50"
              disabled={currentPage === 0}
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage((prev) => prev + 1)}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 dark:text-white rounded"
            >
              Next
            </button>
          </div>
        </div>

        <h3 className="text-lg font-semibold text-gray-700 dark:text-white mb-3">
          {format(new Date(currentDate), 'MMMM d, yyyy')}
        </h3>

        <div className="overflow-x-auto rounded-xl shadow bg-white dark:bg-gray-800">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 uppercase tracking-wide">
              <tr>
                <th className="px-6 py-3">Employee</th>
                <th className="px-6 py-3">Start Date</th>
                <th className="px-6 py-3">End Date</th>
                <th className="px-6 py-3">Reason</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    No leave requests found.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((record) => (
                  <tr key={record._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            record.employeeId?.image
                              ? `${baseURL}${record.employeeId.image}`
                              : `https://ui-avatars.com/api/?name=${record.employeeId?.username || 'User'}`
                          }
                          className="w-10 h-10 rounded-full object-cover"
                          alt="avatar"
                        />
                        <div>
                          <div className="font-medium text-gray-800 dark:text-white">
                            {record.employeeId?.username || 'Unknown'}
                          </div>
                          <div className="text-xs text-gray-400">{record.deviceID}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-800 dark:text-gray-300">
                      {format(new Date(record.startDate), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4 text-gray-800 dark:text-gray-300">
                      {format(new Date(record.endDate), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4 text-gray-800 dark:text-gray-300">
                      {record.type}
                    </td>
                    <td className="px-6 py-4 flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          record.status === 'approved'
                            ? 'bg-green-100 text-green-600'
                            : record.status === 'rejected'
                            ? 'bg-red-100 text-red-600'
                            : 'bg-yellow-100 text-yellow-600'
                        }`}
                      >
                        {record.status}
                      </span>
                      {record.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(record._id, 'approved')}
                            className="text-green-600 text-xs hover:underline ml-20"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(record._id, 'rejected')}
                            className="text-red-600 text-xs hover:underline"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LeaveRequests;
