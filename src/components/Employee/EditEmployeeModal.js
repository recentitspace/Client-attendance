import React, { useState, useEffect } from 'react';
import axios from 'axios';
const baseURL = process.env.REACT_APP_API_BASE;

const EditEmployeeModal = ({ employee, onClose, onUpdate }) => {
  const [employeeData, setEmployeeData] = useState({
    username: '',
    employeeID: '',
    deviceID: '',
    department: '',
    telephone: '',
    jobTitle: '',
    branch: '',
    timetable: '',
    image: null,
  });

  const [timetables, setTimetables] = useState([]);

  useEffect(() => {
    if (employee) {
      setEmployeeData({
        username: employee.username,
        employeeID: employee.employeeID,
        deviceID: employee.deviceID,
        department: employee.department,
        jobTitle: employee.jobTitle,
        telephone: employee.telephone,
        branch: employee.branch,
        timetable: employee.timetable?._id || '',
        image: null,
      });
    }
  }, [employee]);

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
    try {
      const formData = new FormData();
      formData.append('username', employeeData.username);
      formData.append('employeeID', employeeData.employeeID);
      formData.append('deviceID', employeeData.deviceID);
      formData.append('telephone', employeeData.telephone);
      formData.append('jobTitle', employeeData.jobTitle);
      formData.append('department', employeeData.department);
      formData.append('branch', employeeData.branch);
      formData.append('timetable', employeeData.timetable);
      if (employeeData.image) {
        formData.append('image', employeeData.image);
      }

      const token = localStorage.getItem('token');
      await axios.put(
        `${baseURL}api/employees/edit/${employee._id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      onUpdate(); // Refresh list
      onClose();  // Close modal
    } catch (error) {
      console.error('Error updating employee:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-md relative animate-fade-in-down">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white border-b pb-3 dark:border-gray-700">
          Edit Employee
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Left Column */}
            <InputField
              label="Employee Name"
              name="username"
              value={employeeData.username}
              onChange={handleInputChange}
              required
            />
            <InputField
              label="Employee ID"
              name="employeeID"
              value={employeeData.employeeID}
              onChange={handleInputChange}
              required
            />
            <InputField
              label="Device ID"
              name="deviceID"
              value={employeeData.deviceID}
              onChange={handleInputChange}
            />
            <InputField
              label="Telephone"
              name="telephone"
              value={employeeData.telephone}
              onChange={handleInputChange}
              required
            />
            <InputField
              label="Job Title"
              name="jobTitle"
              value={employeeData.jobTitle}
              onChange={handleInputChange}
              required
            />
            <InputField
              label="Department"
              name="department"
              value={employeeData.department}
              onChange={handleInputChange}
              required
            />
            <InputField
              label="Branch"
              name="branch"
              value={employeeData.branch}
              onChange={handleInputChange}
              required
            />

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
                {timetables.map((tt) => (
                  <option key={tt._id} value={tt._id}>
                    {tt.name}
                  </option>
                ))}
              </select>
            </div>

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

          <div className="mt-8 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-lg shadow-md transition-all duration-200 font-medium"
            >
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Input Field Component
const InputField = ({ label, name, value, onChange, required = false }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      {label}
    </label>
    <input
      type="text"
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white shadow-sm"
    />
  </div>
);

export default EditEmployeeModal;
