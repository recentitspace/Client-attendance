import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import DashboardLayout from "../Dashboard/DashboardLayout";
const baseURL = process.env.REACT_APP_API_BASE;

const TimetableDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await axios.get(`${baseURL}api/time-tables/${id}/employees`);
        setEmployees(res.data.data || []);
      } catch (error) {
        console.error("Error fetching employees for timetable:", error);
      }
    };

    fetchEmployees();
  }, [id]);

  return (
    <DashboardLayout>
      <div className="p-8 bg-gray-100 dark:bg-gray-900 min-h-screen text-gray-800 dark:text-gray-100">
        {/* Header and Back Button */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">
            🗓️ Employees in this Timetable
          </h1>
          <button
            onClick={() => navigate("/timetable")}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            ← Back to Timetables
          </button>
        </div>

        {/* Employee Table */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-x-auto">
          <table className="min-w-full text-left table-auto">
            <thead className="bg-blue-50 dark:bg-gray-700 border-b dark:border-gray-600">
              <tr>
                <th className="px-6 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300">Image</th>
                <th className="px-6 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300">Username</th>
                <th className="px-6 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300">Department</th>
                <th className="px-6 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300">Device ID</th>
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-6 text-gray-500 dark:text-gray-400">
                    No employees found.
                  </td>
                </tr>
              ) : (
                employees.map((emp, index) => (
                  <tr
                    key={index}
                    className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                  >
                    <td className="px-6 py-3">
                      <img
                        src={emp.image ? `http://localhost:5000/${emp.image}` : `https://ui-avatars.com/api/?name=${emp.username}`}
                        className="w-10 h-10 rounded-full object-cover"
                        alt="avatar"
                      />
                    </td>
                    <td className="px-6 py-3 font-medium">{emp.username}</td>
                    <td className="px-6 py-3">{emp.department}</td>
                    <td className="px-6 py-3">{emp.deviceID}</td>
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

export default TimetableDetails;
