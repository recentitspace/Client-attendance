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
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-md animate-fade-in-down">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white border-b pb-3 dark:border-gray-700">
          Confirm Deletion
        </h2>
        <div className="py-4">
          <p className="text-gray-600 dark:text-gray-300 mb-2">
            Are you sure you want to delete employee:
          </p>
          <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg mb-4">
            <span className="font-medium text-red-500 text-lg">{employee.username}</span>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            This action cannot be undone.
          </p>
        </div>

        <div className="flex justify-end mt-6 space-x-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-lg shadow-md transition-all duration-200 font-medium flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
