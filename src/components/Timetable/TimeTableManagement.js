import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardLayout from '../Dashboard/DashboardLayout';
import TimetableForm from './TimeTableForm';
import moment from 'moment-timezone';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/solid';
import { useNavigate } from "react-router-dom";

const TimetableApp = () => {
  const [showForm, setShowForm] = useState(false);
  const [filteredTimetables, setFilteredTimetables] = useState([]);
  const [timetables, setTimetables] = useState([]);
  const [selectedTimetable, setSelectedTimetable] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [timetableToDelete, setTimetableToDelete] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchTimetables();
  }, []);

  const fetchTimetables = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/time-tables/all', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTimetables(response.data);
    } catch (error) {
      console.error('Error fetching timetables:', error);
    }
  };

  const formatTimeToAMPM = (timeString) => {
    if (!timeString) return "N/A";
    const [hourStr, minuteStr] = timeString.trim().split(":");
    const hour = parseInt(hourStr);
    const minute = parseInt(minuteStr);
    if (isNaN(hour) || isNaN(minute)) return "Invalid";
    return moment().set({ hour, minute }).format("hh:mm A");
  };

  const handleAddTimetable = async (newTimetable) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/time-tables/create', newTimetable, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTimetables([...timetables, response.data]);
      setSuccessMessage('Timetable created successfully!');
      setShowForm(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error creating timetable:', error);
    }
  };

  const handleUpdateTimetable = async (updatedTimetable) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `http://localhost:5000/api/time-tables/update/${updatedTimetable._id}`,
        updatedTimetable,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updatedList = timetables.map((tt) =>
        tt._id === updatedTimetable._id ? response.data : tt
      );
      setTimetables(updatedList);
      setSuccessMessage('Timetable updated successfully!');
      setSelectedTimetable(null);
      setShowForm(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error updating timetable:', error);
    }
  };

  const handleDeleteClick = (id) => {
    setTimetableToDelete(id);
    setShowDeleteModal(true);
  };

  const handleDeleteTimetable = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/time-tables/delete/${timetableToDelete}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTimetables(timetables.filter((t) => t._id !== timetableToDelete));
      setShowDeleteModal(false);
      setTimetableToDelete(null);
      setSuccessMessage("Timetable deleted successfully.");
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error("Error deleting timetable:", error);
    }
  };

  useEffect(() => {
    const filtered = timetables.filter(tt =>
      tt.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredTimetables(filtered);
  }, [searchTerm, timetables]);
  

  return (
    <DashboardLayout>
      <div className="p-6 bg-gray-100 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-100">
        <div className="flex justify-between items-center mb-4">
          <input
            type="text"
            placeholder="Search for timetable..."
            className="border px-4 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {showForm && (
            <TimetableForm
              onAddTimetable={handleAddTimetable}
              onUpdateTimetable={handleUpdateTimetable}
              existingTimetable={selectedTimetable}
              onClose={() => {
                setShowForm(false);
                setSelectedTimetable(null);
              }}
            />
          )}

          <div className="flex space-x-4">
            <button
              className="bg-[#209ACF] text-white py-2 px-5 rounded-lg hover:bg-[#209ACF] shadow-md"
              onClick={() => {
                setSelectedTimetable(null);
                setShowForm(true);
              }}
            >
              + Add Timetable
            </button>
          
          </div>
        </div>

        {successMessage && (
          <div className="bg-green-500 text-white py-2 px-4 rounded mb-4">
            {successMessage}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
          {filteredTimetables.map((timetable, index) => (
            <div
              key={index}
              onClick={() => navigate(`/timetables/${timetable._id}`)}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg transition duration-300 relative cursor-pointer"
            >
              <h3 className="text-xl font-bold mb-3 text-gray-800 dark:text-white">{timetable.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-300">
                Check-In: {formatTimeToAMPM(timetable.checkInStart)} - {formatTimeToAMPM(timetable.checkInEnd)}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-300">
                Check-Out: {formatTimeToAMPM(timetable.checkOutStart)} - {formatTimeToAMPM(timetable.checkOutEnd)}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-300">Created By: {timetable.adminName || 'Unknown'}</p>

              <div
                className="absolute top-2 right-2 flex gap-2"
                onClick={(e) => e.stopPropagation()}
              >
                <PencilSquareIcon
                  className="w-5 h-5 text-[#209ACF] hover:text-[#209ACF] cursor-pointer"
                  onClick={() => {
                    setSelectedTimetable(timetable);
                    setShowForm(true);
                  }}
                />
                <TrashIcon
                  className="w-5 h-5 text-red-600 hover:text-red-800 cursor-pointer"
                  onClick={() => handleDeleteClick(timetable._id)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-lg p-6 w-full max-w-sm">
            <h2 className="text-xl font-bold mb-2">Confirm Delete</h2>
            <p className="mb-4">Are you sure you want to delete this timetable?</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-700 rounded hover:bg-gray-400 dark:hover:bg-gray-600"
              >
                No
              </button>
              <button
                onClick={handleDeleteTimetable}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default TimetableApp;
