import React, { useState, useEffect } from 'react';
import DashboardLayout from '../Dashboard/DashboardLayout';
import axios from 'axios';
import Swal from 'sweetalert2';
import { PlusIcon, PencilIcon, TrashIcon, XMarkIcon, MegaphoneIcon } from '@heroicons/react/24/outline';
const baseURL = process.env.REACT_APP_API_BASE;

function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [formData, setFormData] = useState({ title: '', description: '', date: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [adminInfo, setAdminInfo] = useState(null);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${baseURL}api/announcements/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAnnouncements(response.data);
    } catch (error) {
      console.error('Error fetching announcements:', error.message);
    }
  };

  useEffect(() => {
    const fetchAdminInfo = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${baseURL}api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAdminInfo(response.data);
      } catch (error) {
        console.error('Error fetching admin info:', error.message);
      }
    };
    
    fetchAdminInfo();
  }, []);

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
      await axios.post(`${baseURL}api/announcements/create`, announcement, {
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
      await axios.put(`${baseURL}api/announcements/edit/${id}`, announcement, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error('Error editing announcement:', error.message);
    }
  };

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
      cancelButtonColor: '#209ACF',  // primary color
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });

    if (confirm.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${baseURL}api/announcements/delete/${id}`, {
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
          confirmButtonColor: '#209ACF' // primary color
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

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <DashboardLayout>
      <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-primary p-2 rounded-lg">
                <MegaphoneIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Announcements</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Manage company-wide announcements</p>
              </div>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200 shadow-sm"
            >
              <PlusIcon className="h-5 w-5" />
              New Announcement
            </button>
          </div>
        </div>

        {/* Announcement Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  {isEditing ? "Edit Announcement" : "Create Announcement"}
                </h3>
                <button 
                  onClick={resetForm}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Title*
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Announcement title"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Date*
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description*
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Announcement details"
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>
                
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg"
                  >
                    {isEditing ? "Update" : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Announcements List */}
        <div className="space-y-4">
          {announcements.length > 0 ? (
            announcements.map((announcement) => (
              <div
                key={announcement._id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700"
              >
                <div className="border-l-4 border-primary px-5 py-4">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-800 dark:text-white text-lg">{announcement.title}</h3>
                      <div className="flex items-center mt-1 gap-2">
                        <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(announcement.date)}</p>
                        <span className="text-gray-400 dark:text-gray-500">•</span>
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-full overflow-hidden">
                            <img 
                              src={adminInfo?.image 
                                ? `${baseURL}${adminInfo.image}` 
                                : `https://ui-avatars.com/api/?name=${adminInfo?.username || 'Admin'}&background=209ACF&color=fff`
                              } 
                              alt="Admin" 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {adminInfo?.username || 'Admin'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(announcement)}
                        className="p-1.5 text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary rounded-md transition-colors"
                        title="Edit"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => deleteAnnouncement(announcement._id)}
                        className="p-1.5 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-500 rounded-md transition-colors"
                        title="Delete"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 text-gray-600 dark:text-gray-300 text-sm whitespace-normal break-words leading-relaxed" style={{ maxWidth: '90%' }}>
                    {announcement.description}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center">
              <div className="flex flex-col items-center justify-center">
                <MegaphoneIcon className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No announcements yet</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">Create your first announcement to share with your team</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <PlusIcon className="h-5 w-5" />
                  New Announcement
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default AdminAnnouncementsPage;
