import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import DashboardLayout from "../Dashboard/DashboardLayout";
import { CalendarIcon, PlusIcon, PencilIcon, TrashIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { format } from "date-fns";

const baseURL = process.env.REACT_APP_API_BASE;

const HolidayManager = () => {
  const [holidays, setHolidays] = useState([]);
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [type, setType] = useState("official");
  const [notes, setNotes] = useState("");
  const [holidayId, setHolidayId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [filteredHolidays, setFilteredHolidays] = useState({});

  const token = localStorage.getItem("token");
  const theme = localStorage.getItem("theme") || "light";

  const axiosConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  useEffect(() => {
    fetchHolidays();
  }, []);

  useEffect(() => {
    // Filter holidays by current year
    const filtered = holidays.filter(holiday => {
      const holidayDate = new Date(holiday.date);
      return holidayDate.getFullYear() === currentYear;
    });
    
    // Group holidays by month
    const grouped = filtered.reduce((acc, holiday) => {
      const month = new Date(holiday.date).getMonth();
      if (!acc[month]) acc[month] = [];
      acc[month].push(holiday);
      return acc;
    }, {});
    
    // Sort holidays within each month
    Object.keys(grouped).forEach(month => {
      grouped[month].sort((a, b) => new Date(a.date) - new Date(b.date));
    });
    
    setFilteredHolidays(grouped);
  }, [holidays, currentYear]);

  const fetchHolidays = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${baseURL}api/holiday`, axiosConfig);
      setHolidays(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch holidays:", err);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name || !date) {
      Swal.fire({
        title: "Error",
        text: "Please fill in all required fields",
        icon: "error",
        background: theme === "dark" ? "#1f2937" : "#ffffff",
        color: theme === "dark" ? "#f9fafb" : "#1f2937",
        confirmButtonColor: "#dc2626",
      });
      return;
    }

    try {
      if (holidayId) {
        await axios.put(
          `${baseURL}api/holiday/update/${holidayId}`,
          { name, date, type, notes },
          axiosConfig
        );
        Swal.fire({
          title: "Success",
          text: "Holiday updated",
          icon: "success",
          background: theme === "dark" ? "#1f2937" : "#ffffff",
          color: theme === "dark" ? "#f9fafb" : "#1f2937",
          confirmButtonColor: "#3b82f6",
          timer: 1500,
          showConfirmButton: false
        });
      } else {
        await axios.post(
          `${baseURL}api/holiday/create`,
          { name, date, type, notes },
          axiosConfig
        );
        Swal.fire({
          title: "Success",
          text: "Holiday added",
          icon: "success",
          background: theme === "dark" ? "#1f2937" : "#ffffff",
          color: theme === "dark" ? "#f9fafb" : "#1f2937",
          confirmButtonColor: "#3b82f6",
          timer: 1500,
          showConfirmButton: false
        });
      }

      setName("");
      setDate("");
      setType("official");
      setNotes("");
      setHolidayId(null);
      setShowForm(false);
      fetchHolidays();
    } catch (err) {
      console.error("Error saving holiday:", err);
      Swal.fire({
        title: "Error",
        text: "Failed to save holiday",
        icon: "error",
        background: theme === "dark" ? "#1f2937" : "#ffffff",
        color: theme === "dark" ? "#f9fafb" : "#1f2937",
        confirmButtonColor: "#dc2626",
      });
    }
  };

  const handleEdit = (holiday) => {
    setHolidayId(holiday._id);
    setName(holiday.name);
    setDate(holiday.date.split("T")[0]);
    setType(holiday.type);
    setNotes(holiday.notes || "");
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      background: theme === "dark" ? "#1f2937" : "#ffffff",
      color: theme === "dark" ? "#f9fafb" : "#1f2937",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#3b82f6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (confirm.isConfirmed) {
      try {
        await axios.delete(`${baseURL}api/holiday/delete/${id}`, axiosConfig);
        fetchHolidays();

        await Swal.fire({
          title: "Deleted!",
          text: "Holiday has been deleted.",
          icon: "success",
          background: theme === "dark" ? "#1f2937" : "#ffffff",
          color: theme === "dark" ? "#f9fafb" : "#1f2937",
          confirmButtonColor: "#6366f1",
          timer: 1500,
          showConfirmButton: false
        });
      } catch (err) {
        console.error("Error deleting holiday:", err);
        Swal.fire({
          title: "Error!",
          text: "Failed to delete the holiday.",
          icon: "error",
          background: theme === "dark" ? "#1f2937" : "#ffffff",
          color: theme === "dark" ? "#f9fafb" : "#1f2937",
          confirmButtonColor: "#e11d48",
        });
      }
    }
  };

  const getTypeClass = (type) => {
    switch (type) {
      case 'official': 
        return 'bg-primary text-white px-2 py-1 rounded-full text-xs font-medium';
      case 'custom': 
        return 'bg-purple-500 text-white px-2 py-1 rounded-full text-xs font-medium';
      case 'half-day': 
        return 'bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium';
      default: 
        return 'bg-gray-500 text-white px-2 py-1 rounded-full text-xs font-medium';
    }
  };

  const getMonthName = (monthIndex) => {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    return months[monthIndex];
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return format(date, 'EEE, MMM d, yyyy');
  };

  const changeYear = (increment) => {
    setCurrentYear(prev => prev + increment);
  };

  return (
    <DashboardLayout>
      <div className="p-6 min-h-screen bg-gray-100 dark:bg-gray-900">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <div className="flex items-center">
            <div className="bg-primary p-2 rounded-lg mr-3">
              <CalendarIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800 dark:text-white">Holiday Management</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Manage company holidays and special events</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center bg-white dark:bg-gray-800 rounded-lg shadow-sm px-3 py-2">
              <button 
                onClick={() => changeYear(-1)}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              <span className="mx-3 font-medium text-gray-700 dark:text-gray-300">{currentYear}</span>
              <button 
                onClick={() => changeYear(1)}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            
            <button
              onClick={() => {
                setShowForm(true);
                setHolidayId(null);
                setName("");
                setDate("");
                setType("official");
                setNotes("");
              }}
              className="bg-primary hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg flex items-center shadow-sm"
            >
              <PlusIcon className="h-5 w-5 mr-1" />
              Add Holiday
            </button>
          </div>
        </div>

        {/* Holiday Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  {holidayId ? "Edit Holiday" : "Add Holiday"}
                </h3>
                <button 
                  onClick={() => setShowForm(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Holiday Name*
                  </label>
                  <input
                    type="text"
                    placeholder="Holiday Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Date*
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="official">Official</option>
                    <option value="custom">Custom</option>
                    <option value="half-day">Half-Day</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Notes (optional)
                  </label>
                  <textarea
                    placeholder="Notes (optional)"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div className="flex justify-end mt-6 space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary hover:bg-blue-600 text-white rounded-lg transition-colors"
                  >
                    {holidayId ? "Update" : "Save"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Main Content */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.keys(filteredHolidays).length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center">
                <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
                  <CalendarIcon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No holidays found</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  There are no holidays scheduled for {currentYear}.
                </p>
                <button
                  onClick={() => {
                    setShowForm(true);
                    setHolidayId(null);
                    setName("");
                    setDate("");
                    setType("official");
                    setNotes("");
                  }}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-blue-600 focus:outline-none"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Add Your First Holiday
                </button>
              </div>
            ) : (
              Object.keys(filteredHolidays)
                .sort((a, b) => parseInt(a) - parseInt(b))
                .map(month => (
                  <div key={month} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                    <div className="px-6 py-4 bg-gray-50 dark:bg-gray-750 border-b border-gray-200 dark:border-gray-700">
                      <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                        {getMonthName(parseInt(month))} {currentYear}
                      </h2>
                    </div>
                    
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredHolidays[month].map(holiday => (
                        <div key={holiday._id} className="px-6 py-4 flex flex-col">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <span className={getTypeClass(holiday.type)}>
                                {holiday.type}
                              </span>
                              <div>
                                <h3 className="text-gray-800 dark:text-white font-medium">{holiday.name}</h3>
                                <p className="text-gray-500 dark:text-gray-400">{formatDate(holiday.date)}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleEdit(holiday)}
                                className="text-blue-500 hover:text-blue-700"
                                title="Edit"
                              >
                                <PencilIcon className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleDelete(holiday._id)}
                                className="text-red-500 hover:text-red-700"
                                title="Delete"
                              >
                                <TrashIcon className="h-5 w-5" />
                              </button>
                            </div>
                          </div>
                          
                          {holiday.notes && (
                            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 pl-12 pr-4">
                              <p className="whitespace-normal break-words leading-tight max-w-full overflow-hidden text-xs" style={{ maxWidth: '80%' }}>
                                {holiday.notes}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default HolidayManager;
