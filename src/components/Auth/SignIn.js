import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
const baseURL = process.env.REACT_APP_API_BASE;

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${baseURL}api/auth/login-admin`, { email, password });
      localStorage.setItem('token', response.data.token);
      navigate('/dashboard');
    } catch (error) {
      setError('Login failed: Email or password is incorrect');
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100 dark:bg-gray-900 transition-colors">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-800 dark:text-white p-8 rounded-lg shadow-md w-96"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Sign In</h2>

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

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-md transition"
        >
          Sign In
        </button>

        <div className="flex justify-between items-center mt-4 text-sm">
          <button
            type="button"
            onClick={() => navigate('/forgot-password')}
            className="text-blue-500 hover:underline"
          >
            Forgot password?
          </button>
          <button
            type="button"
            onClick={() => navigate('/signup')}
            className="text-blue-500 hover:underline"
          >
            Sign Up
          </button>
        </div>
      </form>
    </div>
  );
};

export default SignIn;
