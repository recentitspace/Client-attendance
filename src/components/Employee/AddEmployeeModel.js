import React, { useState, useEffect } from 'react';
import axios from 'axios';
const baseURL = process.env.REACT_APP_API_BASE;

const AddEmployeeModal = ({ onClose, onAdd }) => {
  const [employeeData, setEmployeeData] = useState({
    username: '',
    employeeID: '',
    deviceID: 'Not assigned',
    telephone: '',
    jobTitle: '',
    department: '',
    branch: '',
    timetable: '',
    image: null,
  });

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [timetables, setTimetables] = useState([]);

  useEffect(() => {
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
    fetchTimetables();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEmployeeData({ ...employeeData, [name]: value });
  };

  const handleFileChange = (e) => {
    setEmployeeData({ ...employeeData, image: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage('');

    try {
      const formData = new FormData();
      Object.entries(employeeData).forEach(([key, value]) => {
        formData.append(key, value);
      });

      const token = localStorage.getItem('token');
      const response = await axios.post(`${baseURL}api/employees/add`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200 || response.status === 201) {
        setSuccessMessage('Employee registered successfully!');
        onAdd();
        setTimeout(() => {
          setSuccessMessage('');
          onClose();
        }, 2000);
      } else {
        throw new Error('Failed to add employee');
      }
    } catch (error) {
      console.error('Failed to add employee:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-md relative animate-fade-in-down">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white border-b pb-3 dark:border-gray-700">Add Employee</h2>

        {/* Loading */}
        {loading && (
          <div className="absolute top-4 right-4 bg-blue-500 text-white py-1 px-4 rounded-full text-sm">
            Adding employee...
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="absolute top-4 right-4 bg-green-500 text-white py-1 px-4 rounded-full text-sm">
            {successMessage}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Left/Right columns */}
            {[
              { name: "username", label: "Employee Name" },
              { name: "employeeID", label: "Employee ID" },
              { name: "deviceID", label: "Device ID" },
              { name: "telephone", label: "Telephone" },
              { name: "jobTitle", label: "Job Title" },
              { name: "department", label: "Department" },
              { name: "branch", label: "Branch" },
            ].map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {field.label}
                </label>
                <input
                  type="text"
                  name={field.name}
                  value={employeeData[field.name]}
                  onChange={handleInputChange}
                  required={field.name !== "deviceID"}
                  className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white shadow-sm"
                />
              </div>
            ))}

            {/* Timetable Select */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Timetable
              </label>
              <select
                name="timetable"
                value={employeeData.timetable}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white shadow-sm"
              >
                <option value="">Select Timetable</option>
                {timetables.map((timetable) => (
                  <option key={timetable._id} value={timetable._id}>
                    {timetable.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Image Upload */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Employee Image
              </label>
              <input
                type="file"
                name="image"
                onChange={handleFileChange}
                className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white shadow-sm"
              />
            </div>
          </div>

          {/* Improved buttons at the bottom */}
          <div className="mt-8 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-lg shadow-md transition-all duration-200 font-medium"
            >
              Add
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEmployeeModal;
