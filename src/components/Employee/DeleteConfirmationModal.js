import React from 'react';
import axios from 'axios';
const baseURL = process.env.REACT_APP_API_BASE;

const DeleteConfirmationModal = ({ employee, onClose, onConfirm }) => {
  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${baseURL}api/employees/delete/${employee._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      onConfirm(); // Refresh the employee list
      onClose();   // Close the modal
    } catch (error) {
      console.error('Error deleting employee:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">
          Confirm Deletion
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Are you sure you want to delete <span className="font-medium text-red-500">{employee.username}</span>?
        </p>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg mr-2"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
          >
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
