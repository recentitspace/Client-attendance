import React, { useState, useEffect } from 'react';
import DashboardLayout from '../Dashboard/DashboardLayout';
import axios from 'axios';
import Swal from 'sweetalert2';
const baseURL = process.env.REACT_APP_API_BASE;

function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [formData, setFormData] = useState({ title: '', description: '', date: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${baseURL}/api/announcements/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAnnouncements(response.data);
    } catch (error) {
      console.error('Error fetching announcements:', error.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isEditing) {
      await editAnnouncement(currentId, formData);
    } else {
      await createAnnouncement(formData);
    }
    fetchAnnouncements();
    resetForm();
  };

  const createAnnouncement = async (announcement) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${baseURL}/api/announcements/create`, announcement, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error('Error creating announcement:', error.message);
    }
  };

  const editAnnouncement = async (id, announcement) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${baseURL}/api/announcements/edit/${id}`, announcement, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error('Error editing announcement:', error.message);
    }
  };
  const theme = localStorage.getItem('theme') || 'light';

  const deleteAnnouncement = async (id) => {
    const theme = localStorage.getItem('theme') || 'light';
  
    const confirm = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      background: theme === 'dark' ? '#1f2937' : '#ffffff',
      color: theme === 'dark' ? '#f9fafb' : '#1f2937',
      showCancelButton: true,
      confirmButtonColor: '#dc2626', // red
      cancelButtonColor: '#3b82f6',  // blue
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });
  
    if (confirm.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${baseURL}/api/announcements/delete/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        fetchAnnouncements();
  
        // Success modal also styled
        Swal.fire({
          title: 'Deleted!',
          text: 'The announcement has been deleted.',
          icon: 'success',
          background: theme === 'dark' ? '#1f2937' : '#ffffff',
          color: theme === 'dark' ? '#f9fafb' : '#1f2937',
          confirmButtonColor: '#6366f1' // indigo
        });
      } catch (error) {
        console.error('Error deleting announcement:', error.message);
      }
    }
  };
  

  const handleEdit = (announcement) => {
    setIsEditing(true);
    setFormData({
      title: announcement.title,
      description: announcement.description,
      date: new Date(announcement.date).toISOString().split('T')[0],
    });
    setCurrentId(announcement._id);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({ title: '', description: '', date: '' });
    setIsEditing(false);
    setShowForm(false);
  };

  return (
    <DashboardLayout>
      <div className="p-6 bg-gray-100 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold flex items-center gap-2">
            📢 Admin Announcements
          </h2>
          <button
            className="bg-[#209ACF] text-white py-2 px-4 rounded-lg hover:bg-[#209ACF] transition"
            onClick={() => setShowForm(true)}
          >
            + New Announcement
          </button>
        </div>

        {showForm && (
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 max-w-xl mb-6">
            <h3 className="text-lg font-semibold mb-4">
              {isEditing ? 'Edit Announcement' : 'Create Announcement'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Title"
                  className="p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-700 dark:text-white"
                  required
                />
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Description"
                rows="4"
                className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-700 dark:text-white"
                required
              />
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700"
                >
                  {isEditing ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {announcements.length > 0 ? (
            announcements.map((announcement) => (
              <div
                key={announcement._id}
                className="bg-white dark:bg-gray-800 border-l-4 border-blue-600 shadow-sm p-5 rounded-md"
              >
                <div className="flex items-start gap-2 mb-2">
                  <span>📌</span>
                  <div>
                    <h4 className="text-md font-semibold">{announcement.title}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(announcement.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <p className="text-gray-700 dark:text-gray-200 text-sm mb-4">
                  {announcement.description}
                </p>
                <div className="flex justify-start gap-2">
                  <button
                    onClick={() => handleEdit(announcement)}
                    className="bg-[#209ACF] text-white px-4 py-1 rounded-md hover:bg-[#209ACF]"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteAnnouncement(announcement._id)}
                    className="bg-red-500 text-white px-4 py-1 rounded-md hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-sm">No announcements found.</p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default AdminAnnouncementsPage;
