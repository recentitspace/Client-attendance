import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import DashboardLayout from "../Dashboard/DashboardLayout";
import { CalendarIcon, PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

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

  const token = localStorage.getItem("token");

  const axiosConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

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

  useEffect(() => {
    fetchHolidays();
  }, []);

  const handleSubmit = async () => {
    if (!name || !date) return;

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
          background: localStorage.getItem("theme") === "dark" ? "#1f2937" : "#ffffff",
          color: localStorage.getItem("theme") === "dark" ? "#f9fafb" : "#1f2937",
          confirmButtonColor: "#3b82f6",
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
          background: localStorage.getItem("theme") === "dark" ? "#1f2937" : "#ffffff",
          color: localStorage.getItem("theme") === "dark" ? "#f9fafb" : "#1f2937",
          confirmButtonColor: "#3b82f6",
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
        background: localStorage.getItem("theme") === "dark" ? "#1f2937" : "#ffffff",
        color: localStorage.getItem("theme") === "dark" ? "#f9fafb" : "#1f2937",
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
    const theme = localStorage.getItem("theme") || "light";

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
        return 'bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium';
      case 'custom': 
        return 'bg-purple-500 text-white px-3 py-1 rounded-full text-xs font-medium';
      case 'half-day': 
        return 'bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-medium';
      default: 
        return 'bg-gray-500 text-white px-3 py-1 rounded-full text-xs font-medium';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <DashboardLayout>
      <div className="p-6 min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="bg-blue-500 p-2 rounded-lg mr-3">
              <CalendarIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800 dark:text-white">Holiday Management</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Manage company holidays and special events</p>
            </div>
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
            className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-1" />
            Add Holiday
          </button>
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md">
              <h3 className="text-lg font-medium mb-4 text-gray-800 dark:text-white">
                {holidayId ? "Edit Holiday" : "Add Holiday"}
              </h3>
              <div className="space-y-4">
                <div>
                  <input
                    type="text"
                    placeholder="Holiday Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  >
                    <option value="official">Official</option>
                    <option value="custom">Custom</option>
                    <option value="half-day">Half-Day</option>
                  </select>
                </div>
                <div>
                  <textarea
                    placeholder="Notes (optional)"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              <div className="flex justify-end mt-6 space-x-2">
                <button
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
                >
                  {holidayId ? "Update" : "Save"}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Notes</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {holidays.length > 0 ? (
                    holidays.map((holiday) => (
                      <tr 
                        key={holiday._id} 
                        className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{holiday.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-700 dark:text-gray-300">{formatDate(holiday.date)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={getTypeClass(holiday.type)}>
                            {holiday.type}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-700 dark:text-gray-300 max-w-xs truncate">{holiday.notes || "—"}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleEdit(holiday)}
                              className="text-blue-500 hover:text-blue-700"
                              title="Edit"
                            >
                              <PencilIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(holiday._id);
                              }}
                              className="text-red-500 hover:text-red-700"
                              title="Delete"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">
                        No holidays found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default HolidayManager;
