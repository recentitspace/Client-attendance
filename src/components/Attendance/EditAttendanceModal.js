import React, { useState } from 'react';
import axios from 'axios';

const EditAttendanceModal = ({ isOpen, onClose, attendanceData, onAttendanceUpdated }) => {
  const [checkOutTime, setCheckOutTime] = useState(attendanceData.checkOutTime || '');
  const [status, setStatus] = useState(attendanceData.status || 'present'); // New state for status

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/attendance/edit/${attendanceData._id}`, {
        checkOutTime,
        status, // Include the status in the update
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      onAttendanceUpdated();
      onClose();
    } catch (error) {
      console.error('Error updating attendance:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
      <div className="bg-white rounded-lg w-1/3 max-w-md">
        <div className="flex justify-between items-center bg-blue-600 text-white p-4 rounded-t-lg">
          <h2 className="text-xl">Edit Attendance</h2>
          <button onClick={onClose} className="text-white font-bold">X</button>
        </div>
        <div className="p-4">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Check-Out Time</label>
              <input
                type="datetime-local"
                value={checkOutTime}
                onChange={(e) => setCheckOutTime(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="onLeave">On Leave</option>
              </select>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg mr-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
              >
                Update
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditAttendanceModal;
