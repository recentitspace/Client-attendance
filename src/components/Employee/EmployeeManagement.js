import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardLayout from '../Dashboard/DashboardLayout';
import AddEmployeeModal from './AddEmployeeModel';
import EditEmployeeModal from './EditEmployeeModal';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import { UserIcon } from '@heroicons/react/24/outline';
import { ChevronDownIcon, ArrowDownTrayIcon } from '@heroicons/react/20/solid';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
const baseURL = process.env.REACT_APP_API_BASE;

const EmployeeManagement = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [filteredEmployees, setFilteredEmployees] = useState([]);

  const [visibleColumns, setVisibleColumns] = useState({
    image: true,
    employeeID: true,
    name: true,
    deviceID: true,
    department: true,
    telephone: true,
    jobTitle: true,
    branch: true,
    timetable: true,
    actions: true,
  });

  const [isFilterModalOpen, setFilterModalOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${baseURL}api/employees`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmployees(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching employees:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    setFilteredEmployees(employees);
  }, [employees]);

  const handleSearch = (e) => {
    const searchValue = e.target.value.toLowerCase();
    setSearchTerm(searchValue);
    const filtered = employees.filter(employee =>
      employee.employeeID.toLowerCase().includes(searchValue) ||
      employee.username.toLowerCase().includes(searchValue) ||
      employee.deviceID.toLowerCase().includes(searchValue) ||
      employee.telephone.toLowerCase().includes(searchValue) ||
      employee.jobTitle.toLowerCase().includes(searchValue) ||
      employee.department.toLowerCase().includes(searchValue) ||
      employee.branch.toLowerCase().includes(searchValue) ||
      (employee.timetable && typeof employee.timetable === 'string' && employee.timetable.toLowerCase().includes(searchValue))
    );
    setFilteredEmployees(filtered);
  };

  const handleColumnToggle = (column) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [column]: !prev[column],
    }));
  };

  const handleEditEmployee = (employee) => {
    setSelectedEmployee(employee);
    setEditModalOpen(true);
  };

  const handleDeleteEmployee = (employee) => {
    setSelectedEmployee(employee);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${baseURL}api/employees/delete/${selectedEmployee._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmployees(employees.filter(emp => emp._id !== selectedEmployee._id));
      setDeleteModalOpen(false);
    } catch (error) {
      console.error('Error deleting employee:', error);
    }
  };
  const exportEmployeesToPDF = () => {
    const doc = new jsPDF();
    
    const columns = [
      { header: "Name", dataKey: "name" },
      { header: "Employee ID", dataKey: "employeeID" },
      { header: "Device ID", dataKey: "deviceID" },
      { header: "Telephone", dataKey: "telephone" },
      { header: "Job Title", dataKey: "jobTitle" },
      { header: "Department", dataKey: "department" },
      { header: "Branch", dataKey: "branch" },
      { header: "Timetable", dataKey: "timetable" },
    ];
  
    const rows = employees.map(emp => ({
      name: emp.username,
      employeeID: emp.employeeID,
      deviceID: emp.deviceID,
      telephone: emp.telephone,
      jobTitle: emp.jobTitle,
      department: emp.department,
      branch: emp.branch,
      timetable: emp.timetable ? emp.timetable.name : 'Not Assigned',
    }));
  
    autoTable(doc, {
      columns,
      body: rows,
      styles: {
        fontSize: 9,
        cellPadding: 2,
      },
      columnStyles: {
        image: { cellWidth: 30 },
        name: { cellWidth: 25 },
        telephone: { cellWidth: 30 }
      }
    });
  
    doc.save('Employees.pdf');
  };
  
  const exportEmployeesToExcel = () => {
    const cleanData = employees.map(emp => ({
      Name: emp.username,
      'Employee ID': emp.employeeID,
      'Device ID': emp.deviceID,
      Telephone: emp.telephone,
      'Job Title': emp.jobTitle,
      Department: emp.department,
      Branch: emp.branch,
      Timetable: emp.timetable?.name || 'Not Assigned',
      // Image field removed for cleaner output
    }));

    const worksheet = XLSX.utils.json_to_sheet(cleanData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Employees');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, 'Employees.xlsx');
  };

  const toggleExportMenu = () => {
    setExportMenuOpen(!exportMenuOpen);
  };

  const exportToPDF = () => {
    exportEmployeesToPDF();
    setExportMenuOpen(false);
  };

  const exportToExcel = () => {
    exportEmployeesToExcel();
    setExportMenuOpen(false);
  };

  return (
    <DashboardLayout>
      <div className="p-6 bg-gray-100 dark:bg-gray-900 min-h-screen">
        {/* Header Section */}
        <div className="flex flex-col space-y-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-500 dark:bg-blue-600 p-2 rounded-lg">
                <UserIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Employees</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Manage your team members</p>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <div className="relative">
                <button
                  onClick={toggleExportMenu}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                  <span>Export</span>
                  <ChevronDownIcon className="h-5 w-5" />
                </button>
                {exportMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 border dark:border-gray-700">
                    <ul className="py-1">
                      <li>
                        <button
                          onClick={() => {
                            exportEmployeesToPDF();
                            setExportMenuOpen(false);
                          }}
                          className="block w-full text-left px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          Export as PDF
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => {
                            exportEmployeesToExcel();
                            setExportMenuOpen(false);
                          }}
                          className="block w-full text-left px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          Export as Excel
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
              
              <button
                onClick={() => setFilterModalOpen(true)}
                className="flex items-center space-x-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg transition-colors"
              >
                <span>Filters</span>
                <ChevronDownIcon className="h-5 w-5" />
              </button>
              
              <button
                onClick={() => setModalOpen(true)}
                className="bg-primary hover:bg-primary/90 text-white font-medium py-2.5 px-5 rounded-lg shadow-lg inline-flex items-center transition-all duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Employee
              </button>
            </div>
          </div>
          
          {/* Search Bar - Now with more space above and below */}
          <div className="relative mt-4 mb-6">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400 dark:text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search for name, id, department..."
              value={searchTerm}
              onChange={handleSearch}
              className="pl-10 pr-4 py-3 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            />
          </div>
        </div>

        {/* Filter Modal */}
        {isFilterModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-96 shadow-2xl transform transition-all animate-fade-in-up">
              <h3 className="text-xl font-semibold mb-5 text-gray-800 dark:text-white border-b pb-3 dark:border-gray-700">
                Select Columns to Display
              </h3>
              <div className="grid grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-2">
                {Object.keys(visibleColumns).map(column => (
                  <label key={column} className="flex items-center space-x-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <input
                      type="checkbox"
                      checked={visibleColumns[column]}
                      onChange={() => handleColumnToggle(column)}
                      className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary dark:border-gray-600"
                    />
                    <span className="text-gray-800 dark:text-gray-200 font-medium capitalize">{column}</span>
                  </label>
                ))}
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setFilterModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setFilterModalOpen(false)}
                  className="bg-primary hover:bg-primary/90 text-white px-5 py-2 rounded-lg shadow-md transition-all duration-200 font-medium"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Employee Table */}
        {loading ? (
          <p className="text-gray-700 dark:text-gray-300">Loading employees...</p>
        ) : (
          <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md border dark:border-gray-700">
            <thead className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
              <tr className="border-b dark:border-gray-600">
                {visibleColumns.image && <th className="py-2 px-4 text-left">Image</th>}
                {visibleColumns.employeeID && <th className="py-2 px-4 text-left">Employee ID</th>}
                {visibleColumns.name && <th className="py-2 px-4 text-left">Name</th>}
                {visibleColumns.deviceID && <th className="py-2 px-4 text-left">Device ID</th>}
                {visibleColumns.telephone && <th className="py-2 px-4 text-left">Telephone</th>}
                {visibleColumns.jobTitle && <th className="py-2 px-4 text-left">Job Title</th>}
                {visibleColumns.department && <th className="py-2 px-4 text-left">Department</th>}
                {visibleColumns.branch && <th className="py-2 px-4 text-left">Branch</th>}
                {visibleColumns.timetable && <th className="py-2 px-4 text-left">Timetable</th>}
                {visibleColumns.actions && <th className="py-2 px-4 text-center">Actions</th>}
              </tr>
            </thead>
            <tbody className="text-gray-700 dark:text-gray-300 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredEmployees.map((employee, index) => (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-750 even:bg-gray-50 dark:even:bg-gray-700/50 transition-colors">
                  {visibleColumns.image && (
                    <td className="py-3 px-4">
                      <div className="relative">
                        {employee.image ? (
                          <img
                            src={`${baseURL}${employee.image}`}
                            alt={employee.username}
                            className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-gray-700 shadow-sm"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center border-2 border-white dark:border-gray-700 shadow-sm">
                            <span className="text-primary text-sm font-medium">
                              {employee.username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-green-500 border-2 border-white dark:border-gray-800"></div>
                      </div>
                    </td>
                  )}
                  {visibleColumns.employeeID && (
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900 dark:text-white">{employee.employeeID}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">ID</div>
                    </td>
                  )}
                  {visibleColumns.name && (
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900 dark:text-white">{employee.username}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary mr-1"></span>
                        Active
                      </div>
                    </td>
                  )}
                  {visibleColumns.deviceID && (
                    <td className="py-3 px-4">
                      <div className="px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 text-xs text-blue-700 dark:text-blue-400 inline-block">
                        {employee.deviceID}
                      </div>
                    </td>
                  )}
                  {visibleColumns.telephone && (
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <svg className="w-3 h-3 text-gray-400 dark:text-gray-500 mr-1.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                        </svg>
                        <span>{employee.telephone}</span>
                      </div>
                    </td>
                  )}
                  {visibleColumns.jobTitle && (
                    <td className="py-3 px-4">
                      <div className="font-medium">{employee.jobTitle}</div>
                    </td>
                  )}
                  {visibleColumns.department && (
                    <td className="py-3 px-4">
                      <div className="px-2.5 py-1 rounded-md bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800/30 text-xs text-purple-700 dark:text-purple-400 inline-block">
                        {employee.department}
                      </div>
                    </td>
                  )}
                  {visibleColumns.branch && (
                    <td className="py-3 px-4">
                      <div className="px-2.5 py-1 rounded-md bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/30 text-xs text-amber-700 dark:text-amber-400 inline-block">
                        {employee.branch}
                      </div>
                    </td>
                  )}
                  {visibleColumns.timetable && (
                    <td className="py-3 px-4">
                      <div className="px-2.5 py-1 rounded-md bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/30 text-xs text-green-700 dark:text-green-400 inline-block">
                        {employee.timetable ? employee.timetable.name : 'Not Assigned'}
                      </div>
                    </td>
                  )}
                  {visibleColumns.actions && (
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleEditEmployee(employee)}
                          className="bg-primary hover:bg-primary/90 text-white font-medium py-1 px-3 rounded-md text-sm transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteEmployee(employee)}
                          className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium py-1 px-3 rounded-md text-sm transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Modals */}
        {modalOpen && <AddEmployeeModal onClose={() => setModalOpen(false)} onAdd={fetchEmployees} />}
        {editModalOpen && <EditEmployeeModal employee={selectedEmployee} onClose={() => setEditModalOpen(false)} onUpdate={fetchEmployees} />}
        {deleteModalOpen && <DeleteConfirmationModal employee={selectedEmployee} onClose={() => setDeleteModalOpen(false)} onConfirm={fetchEmployees} />}
      </div>
    </DashboardLayout>
  );
};

export default EmployeeManagement;
