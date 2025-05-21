import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import DashboardLayout from "../Dashboard/DashboardLayout";
import { 
  ArrowLeftIcon, 
  UserCircleIcon, 
  BuildingOfficeIcon, 
  DevicePhoneMobileIcon,
  ClockIcon,
  CalendarIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline";

const baseURL = process.env.REACT_APP_API_BASE;

const TimetableDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [timetable, setTimetable] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTimetableDetails = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        
        // Fetch timetable details
        const timetableResponse = await axios.get(`${baseURL}api/time-tables/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        setTimetable(timetableResponse.data);
        
        try {
          // Use the correct endpoint for fetching employees by timetable
          console.log("Fetching employees with URL:", `${baseURL}api/time-tables/${id}/employees`);
          const employeesResponse = await axios.get(`${baseURL}api/time-tables/${id}/employees`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          
          console.log("Employees API response:", employeesResponse.data);
          
          // Extract employees from the data property based on the API response structure
          const employeesData = employeesResponse.data.data || [];
          
          console.log("Processed employees data:", employeesData);
          setEmployees(employeesData);
        } catch (empErr) {
          console.error("Error fetching employees:", empErr);
          console.error("Error details:", empErr.response?.data || empErr.message);
          setEmployees([]);
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching timetable details:", err);
        setError("Failed to load timetable details. Please try again.");
        setLoading(false);
      }
    };

    fetchTimetableDetails();
  }, [id]);

  const formatTimeToAMPM = (timeString) => {
    if (!timeString) return "N/A";
    const [hourStr, minuteStr] = timeString.split(":");
    if (!hourStr || !minuteStr) return "N/A";
    
    const hour = parseInt(hourStr);
    const minute = parseInt(minuteStr);
    
    if (isNaN(hour) || isNaN(minute)) return "N/A";
    
    const date = new Date();
    date.setHours(hour, minute, 0);
    
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
  };

  const getWorkingDaysString = (days) => {
    if (!days || !Array.isArray(days) || days.length === 0) return "No days set";
    
    return days.join(", ");
  };

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    // Re-trigger the useEffect
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        
        const timetableResponse = await axios.get(`${baseURL}api/time-tables/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        const employeesResponse = await axios.get(`${baseURL}api/time-tables/${id}/employees`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        setTimetable(timetableResponse.data);
        setEmployees(employeesResponse.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching timetable details:", err);
        setError("Failed to load timetable details. Please try again.");
        setLoading(false);
      }
    };
    
    fetchData();
  };

  return (
    <DashboardLayout>
      <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
        {/* Header with back button */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">
              Timetable Details
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {loading ? "Loading timetable..." : (timetable ? timetable.name : "Timetable not found")}
            </p>
          </div>
          <button
            onClick={() => navigate("/timetable")}
            className="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Timetables
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-6 rounded-lg shadow-sm mb-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-red-800 dark:text-red-200">Failed to load timetable details</h3>
                <div className="mt-2">
                  <p className="text-sm text-red-700 dark:text-red-300">
                    There was an error loading the timetable information. Please try again.
                  </p>
                </div>
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={handleRetry}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : !timetable ? (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-6 rounded-lg shadow-sm">
            <div className="flex">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-yellow-800 dark:text-yellow-200">Timetable not found</h3>
                <div className="mt-2">
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    The requested timetable could not be found. It may have been deleted or you may not have permission to view it.
                  </p>
                </div>
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => navigate("/timetable")}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                  >
                    Return to Timetables
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Timetable Summary Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Timetable Summary</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-10 w-10 rounded-md bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                      <ClockIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">Shift Type</h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 capitalize">{timetable.shiftType || "Standard"}</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-10 w-10 rounded-md bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                      <CalendarIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">Working Days</h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {getWorkingDaysString(timetable.workingDays)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-10 w-10 rounded-md bg-green-100 dark:bg-green-900 flex items-center justify-center">
                      <ClockIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">Check-In Time</h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {formatTimeToAMPM(timetable.checkInStart)} - {formatTimeToAMPM(timetable.checkInEnd)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-10 w-10 rounded-md bg-red-100 dark:bg-red-900 flex items-center justify-center">
                      <ClockIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">Check-Out Time</h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {formatTimeToAMPM(timetable.checkOutStart)} - {formatTimeToAMPM(timetable.checkOutEnd)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-10 w-10 rounded-md bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
                      <svg className="h-6 w-6 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">Allowances</h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Late: {timetable.lateAllowance || 0} min | Early Leave: {timetable.earlyLeaveAllowance || 0} min
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-10 w-10 rounded-md bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                      <UserCircleIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">Assigned Employees</h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {employees.length} {employees.length === 1 ? 'employee' : 'employees'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Employees Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <UserCircleIcon className="w-5 h-5 mr-2 text-primary" />
                  Employees in this Timetable
                </h2>
                <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {employees.length} {employees.length === 1 ? 'employee' : 'employees'}
                </span>
              </div>

              <div className="overflow-x-auto">
                {employees.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No employees found</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      No employees are currently assigned to this timetable.
                    </p>
                  </div>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-750">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Employee
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Department
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Device ID
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {employees.map((employee) => (
                        <tr key={employee._id} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <img 
                                  className="h-10 w-10 rounded-full object-cover" 
                                  src={employee.image ? `${baseURL}${employee.image}` : `https://ui-avatars.com/api/?name=${employee.username}&background=random`} 
                                  alt={`${employee.username}'s avatar`} 
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = `https://ui-avatars.com/api/?name=${employee.username}&background=random`;
                                  }}
                                />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {employee.username}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {employee.email || "No email"}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <BuildingOfficeIcon className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="text-sm text-gray-900 dark:text-white capitalize">
                                {employee.department || "Not assigned"}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <DevicePhoneMobileIcon className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="text-sm text-gray-900 dark:text-white">
                                {employee.deviceID || "Not assigned"}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              employee.status === "active" 
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}>
                              {employee.status || "Not assigned"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TimetableDetails;
