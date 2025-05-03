import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardLayout from '../Dashboard/DashboardLayout';
import AddEmployeeModal from './AddEmployeeModel';
import EditEmployeeModal from './EditEmployeeModal';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import { UserIcon } from '@heroicons/react/outline';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
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
  
  const exportToExcel = () => {
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
  
  return (
    <DashboardLayout>
      <div className="bg-white dark:bg-[#1B2A41] p-6 rounded-lg shadow-lg">
        <h1 className="text-3xl font-semibold mb-6 text-gray-800 dark:text-white">Employees</h1>

        <div className="flex justify-between items-center mb-6">
          <input
            type="text"
            placeholder="Search for name, id..."
            value={searchTerm}
            onChange={handleSearch}
            className="border dark:border-gray-700 px-4 py-2 rounded-lg shadow-sm w-1/3 bg-white dark:bg-gray-800 text-gray-700 dark:text-white"
          />
          <div className="flex items-center space-x-4">
          <div className="flex gap-2">
          <div className="relative">
  <button
    onClick={() => setDropdownOpen(!dropdownOpen)}
    className="bg-green-600 text-white px-4 py-2 rounded inline-flex items-center"
  >
    Export
    <ChevronDownIcon className="w-4 h-4 ml-2" />
  </button>
  {dropdownOpen && (
    <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-700 rounded shadow-lg z-50">
      <button
        onClick={() => {
          exportEmployeesToPDF();
          setDropdownOpen(false);
        }}
        className="block px-4 py-2 text-sm text-left text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 w-full"
      >
        Export as PDF
      </button>
      <button
        onClick={() => {
          exportToExcel();
          setDropdownOpen(false);
        }}
        className="block px-4 py-2 text-sm text-left text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 w-full"
      >
        Export as Excel
      </button>
    </div>
  )}
</div>


          </div>

            <button
              onClick={() => setFilterModalOpen(true)}
              className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-white px-4 py-2 rounded-lg shadow"
            >
              Filters
            </button>

            <button
              onClick={() => setModalOpen(true)}
              className="bg-[#209ACF] hover:bg-[#219ACF]/20 text-white font-bold py-2 px-4 rounded-lg shadow-lg"
            >
              + Add Employee
            </button>
          </div>
        </div>

        {/* Filter Modal */}
        {isFilterModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-1/3">
              <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Select Columns to Display</h3>
              <div className="space-y-3">
                {Object.keys(visibleColumns).map(column => (
                  <label key={column} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={visibleColumns[column]}
                      onChange={() => handleColumnToggle(column)}
                      className="text-[#209ACF]"
                    />
                    <span className="text-gray-800 dark:text-gray-200">{column.charAt(0).toUpperCase() + column.slice(1)}</span>
                  </label>
                ))}
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setFilterModalOpen(false)}
                  className="bg-[#209ACF] hover:bg-[#209ACF] text-white px-4 py-2 rounded-lg"
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
            <tbody className="text-gray-700 dark:text-gray-300">
              {filteredEmployees.map((employee, index) => (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 border-t dark:border-gray-600">
                  {visibleColumns.image && (
                    <td className="py-3 px-4">
                      {employee.image ? (
                        <img
                          src={`${baseURL}${employee.image}`}
                          alt={employee.username}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <UserIcon className="w-12 h-12 text-gray-400" />
                      )}
                    </td>
                  )}
                  {visibleColumns.employeeID && <td className="py-3 px-4">{employee.employeeID}</td>}
                  {visibleColumns.name && <td className="py-3 px-4">{employee.username}</td>}
                  {visibleColumns.deviceID && <td className="py-3 px-4">{employee.deviceID}</td>}
                  {visibleColumns.telephone && <td className="py-3 px-4">{employee.telephone}</td>}
                  {visibleColumns.jobTitle && <td className="py-3 px-4">{employee.jobTitle}</td>}
                  {visibleColumns.department && <td className="py-3 px-4">{employee.department}</td>}
                  {visibleColumns.branch && <td className="py-3 px-4">{employee.branch}</td>}
                  {visibleColumns.timetable && (
                    <td className="py-3 px-4">{employee.timetable ? employee.timetable.name : 'Not Assigned'}</td>
                  )}
                  {visibleColumns.actions && (
                    <td className="py-3 px-4 text-center space-x-2">
                      <button
                        onClick={() => handleEditEmployee(employee)}
                        className="bg-[#209ACF] hover:bg-[#209ACF] text-white font-bold py-1 px-3 rounded-lg"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteEmployee(employee)}
                        className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-1 px-3 rounded-lg"
                      >
                        Delete
                      </button>
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
