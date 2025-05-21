import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardLayout from '../Dashboard/DashboardLayout';
import TimetableForm from './TimeTableForm';
import moment from 'moment-timezone';
import { PencilSquareIcon, TrashIcon, ClockIcon, CalendarIcon, UsersIcon } from '@heroicons/react/24/outline';
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
const baseURL = process.env.REACT_APP_API_BASE;

const TimeTableApp = () => {
  const [timetables, setTimetables] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedTimetable, setSelectedTimetable] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchTimetables();
  }, []);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const fetchTimetables = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${baseURL}api/time-tables/all`, {
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

  const handleAddTimetable = async (timetableData) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${baseURL}api/time-tables/create`, timetableData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Replace success message with SweetAlert2
      const theme = localStorage.getItem('theme') || 'light';
      Swal.fire({
        title: 'Success!',
        text: 'Timetable added successfully!',
        icon: 'success',
        confirmButtonColor: '#209ACF', // primary color
        background: theme === 'dark' ? '#1f2937' : '#ffffff',
        color: theme === 'dark' ? '#f9fafb' : '#1f2937',
        borderRadius: '0.5rem',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false
      });
      
      fetchTimetables();
      setShowForm(false);
    } catch (error) {
      console.error('Error adding timetable:', error);
      
      const theme = localStorage.getItem('theme') || 'light';
      Swal.fire({
        title: 'Error!',
        text: 'Failed to add the timetable.',
        icon: 'error',
        confirmButtonColor: '#e11d48',
        background: theme === 'dark' ? '#1f2937' : '#ffffff',
        color: theme === 'dark' ? '#f9fafb' : '#1f2937',
        borderRadius: '0.5rem',
      });
    }
  };

  const handleUpdateTimetable = async (timetableData) => {
    try {
      const token = localStorage.getItem('token');
      const id = timetableData._id; // Extract ID from the timetable data
      
      console.log("Updating timetable with ID:", id);
      console.log("Updating timetable with URL:", `${baseURL}api/time-tables/update/${id}`);
      console.log("Update data:", timetableData);
      
      // Fix the API endpoint and ensure we have a valid ID
      if (!id) {
        throw new Error("Missing timetable ID");
      }
      
      await axios.put(`${baseURL}api/time-tables/update/${id}`, timetableData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Replace success message with SweetAlert2
      const theme = localStorage.getItem('theme') || 'light';
      Swal.fire({
        title: 'Success!',
        text: 'Timetable updated successfully!',
        icon: 'success',
        confirmButtonColor: '#209ACF', // primary color
        background: theme === 'dark' ? '#1f2937' : '#ffffff',
        color: theme === 'dark' ? '#f9fafb' : '#1f2937',
        borderRadius: '0.5rem',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false
      });
      
      fetchTimetables();
      setShowForm(false);
      setSelectedTimetable(null);
    } catch (error) {
      console.error('Error updating timetable:', error);
      console.error('Error details:', error.response?.data || error.message);
      
      const theme = localStorage.getItem('theme') || 'light';
      Swal.fire({
        title: 'Error!',
        text: 'Failed to update the timetable.',
        icon: 'error',
        confirmButtonColor: '#e11d48',
        background: theme === 'dark' ? '#1f2937' : '#ffffff',
        color: theme === 'dark' ? '#f9fafb' : '#1f2937',
        borderRadius: '0.5rem',
      });
    }
  };

  const handleDeleteClick = async (id) => {
    const theme = localStorage.getItem('theme') || 'light';
    
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626', // red
      cancelButtonColor: '#3b82f6',  // blue
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      background: theme === 'dark' ? '#1f2937' : '#ffffff',
      color: theme === 'dark' ? '#f9fafb' : '#1f2937',
      borderRadius: '0.5rem',
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${baseURL}api/time-tables/delete/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        Swal.fire({
          title: 'Deleted!',
          text: 'Timetable deleted successfully!',
          icon: 'success',
          confirmButtonColor: '#6366f1', // indigo
          background: theme === 'dark' ? '#1f2937' : '#ffffff',
          color: theme === 'dark' ? '#f9fafb' : '#1f2937',
          borderRadius: '0.5rem',
        });
        
        fetchTimetables();
      } catch (error) {
        console.error('Error deleting timetable:', error);
        Swal.fire({
          title: 'Error!',
          text: 'Failed to delete the timetable.',
          icon: 'error',
          confirmButtonColor: '#e11d48',
          background: theme === 'dark' ? '#1f2937' : '#ffffff',
          color: theme === 'dark' ? '#f9fafb' : '#1f2937',
          borderRadius: '0.5rem',
        });
      }
    }
  };

  const filteredTimetables = timetables.filter((timetable) =>
    timetable.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getWorkingDaysString = (days) => {
    if (!days || days.length === 0) return "No days set";
    
    // Map of abbreviated day names
    const dayMap = {
      monday: "Mon",
      tuesday: "Tue",
      wednesday: "Wed",
      thursday: "Thu",
      friday: "Fri",
      saturday: "Sat",
      sunday: "Sun"
    };
    
    // Convert to abbreviated format
    const abbreviatedDays = days.map(day => dayMap[day.toLowerCase()] || day);
    
    // If all weekdays are selected
    const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri"];
    const hasAllWeekdays = weekdays.every(day => abbreviatedDays.includes(day));
    
    // If all weekend days are selected
    const weekend = ["Sat", "Sun"];
    const hasAllWeekend = weekend.every(day => abbreviatedDays.includes(day));
    
    if (hasAllWeekdays && hasAllWeekend) {
      return "All days";
    } else if (hasAllWeekdays) {
      return "Weekdays";
    } else if (hasAllWeekend) {
      return "Weekends";
    } else if (abbreviatedDays.length > 3) {
      return `${abbreviatedDays.length} days`;
    } else {
      return abbreviatedDays.join(", ");
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Timetable Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Create and manage employee work schedules</p>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search timetables..."
              className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-gray-800 dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button
            className="w-full md:w-auto bg-primary hover:bg-blue-600 text-white py-2 px-4 rounded-lg shadow-sm transition duration-150 ease-in-out flex items-center justify-center"
            onClick={() => {
              setSelectedTimetable(null);
              setShowForm(true);
            }}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Add Timetable
          </button>
        </div>

        {successMessage && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded shadow-sm animate-fade-in-down">
            <div className="flex items-center">
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <p>{successMessage}</p>
            </div>
          </div>
        )}

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

        {filteredTimetables.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
              <CalendarIcon className="h-8 w-8 text-gray-500 dark:text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No timetables found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">Create your first timetable to get started</p>
            <button
              onClick={() => {
                setSelectedTimetable(null);
                setShowForm(true);
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Create Timetable
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTimetables.map((timetable) => (
              <div
                key={timetable._id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition duration-150 ease-in-out"
              >
                <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">{timetable.name}</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTimetable(timetable);
                        setShowForm(true);
                      }}
                      className="text-gray-500 hover:text-primary transition-colors"
                      title="Edit"
                    >
                      <PencilSquareIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(timetable._id);
                      }}
                      className="text-gray-500 hover:text-red-600 transition-colors"
                      title="Delete"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                <div className="p-5 cursor-pointer" onClick={() => navigate(`/timetables/${timetable._id}`)}>
                  <div className="space-y-3">
                    {timetable.shiftType === "weekly" ? (
                      <>
                        <div className="flex items-start">
                          <CalendarIcon className="w-5 h-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Working Days</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{getWorkingDaysString(timetable.workingDays)}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <ClockIcon className="w-5 h-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Schedule</p>
                            {timetable.workingDays && timetable.workingDays.length > 0 && timetable.weeklySchedule ? (
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {formatTimeToAMPM(timetable.weeklySchedule[timetable.workingDays[0]]?.checkIn)} - {formatTimeToAMPM(timetable.weeklySchedule[timetable.workingDays[0]]?.checkOut)}
                              </p>
                            ) : (
                              <p className="text-sm text-gray-500 dark:text-gray-400">No schedule set</p>
                            )}
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-start">
                        <ClockIcon className="w-5 h-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Shift Type</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{timetable.shiftType || "Not specified"}</p>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-start">
                      <UsersIcon className="w-5 h-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Created By</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{timetable.adminName || "Unknown"}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/timetables/${timetable._id}`);
                      }}
                      className="w-full text-center text-sm font-medium text-primary hover:text-blue-600 transition-colors"
                    >
                      View Employees →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TimeTableApp;
