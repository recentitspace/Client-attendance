import React, { useEffect, useState } from 'react';
import axios from 'axios';
const baseURL = process.env.REACT_APP_API_BASE;


const ProfileDropdown = () => {
    const [open, setOpen] = useState(false);
    const [admin, setAdmin] = useState(null);
  
    useEffect(() => {
      const token = localStorage.getItem('token');
      axios.get('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => setAdmin(res.data));
    }, []);
  
    const handleImageChange = async (e) => {
      const formData = new FormData();
      formData.append('image', e.target.files[0]);
  
      const token = localStorage.getItem('token');
      const res = await axios.patch('/api/auth/me/photo', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setAdmin(res.data);
    };
  
    return (
      <div className="relative">
        <button onClick={() => setOpen(!open)} className="focus:outline-none">
          <img src={admin?.image || '/default.png'} className="w-8 h-8 rounded-full" />
        </button>
  
        {open && (
          <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 shadow-md rounded-md p-4 z-50">
            <div className="flex items-center space-x-4">
              <label htmlFor="profile-upload" className="cursor-pointer">
                <img
                  src={admin?.image || '/default.png'}
                  alt="Profile"
                  className="w-12 h-12 rounded-full object-cover"
                />
                <input
                  id="profile-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">{admin?.username}</p>
                <p className="text-sm text-gray-500 dark:text-gray-300 capitalize">{admin?.role}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };
  
export default ProfileDropdown;