import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
const baseURL = process.env.REACT_APP_API_BASE;

const SignUp = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [employeeID, setEmployeeID] = useState('');
  const [role, setRole] = useState('employee');
  const [image, setImage] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('username', name);
      formData.append('email', email);
      formData.append('password', password);
      formData.append('role', role);
      if (image) {
        formData.append('image', image);
      }
  
      await axios.post(`${baseURL}api/auth/register-admin`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
  
      navigate('/login');
    } catch (error) {
      console.error(error);
      setError('Registration failed. Please try again.');
    }
  };
  

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md w-96"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Sign Up</h2>

        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 mb-4 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 mb-4 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 mb-4 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          required
        />
       

        <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
            className="w-full p-2 mb-4 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />


        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-md transition"
        >
          Sign Up
        </button>

        <button
          type="button"
          onClick={() => navigate('/login')}
          className="w-full mt-4 text-blue-500 hover:underline"
        >
          Already have an account? Sign In
        </button>
      </form>
    </div>
  );
};

export default SignUp;
