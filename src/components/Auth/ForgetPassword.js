import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
const baseURL = process.env.REACT_APP_API_BASE;

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${baseURL}api/auth/forgot-password`, { email });
      setMessage('Verification code sent to your email.');
    } catch (error) {
      setMessage('Error sending verification code.');
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors">
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Reset Password</h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 mb-4 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          required
        />

        {message && <p className="text-green-500 dark:text-green-400 text-center mb-4">{message}</p>}

        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold p-2 rounded-md transition"
        >
          Send Verification Code
        </button>

        <button
          type="button"
          onClick={() => navigate('/login')}
          className="w-full text-blue-500 hover:underline mt-4"
        >
          Back to Sign In
        </button>
      </form>
    </div>
  );
};

export default ForgotPassword;
