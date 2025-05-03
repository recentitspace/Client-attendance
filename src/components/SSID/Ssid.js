import React, { useState } from 'react';
import axios from 'axios';
import DashboardLayout from '../Dashboard/DashboardLayout';

const WiFiConfig = () => {
  const [ssid, setSsid] = useState('');
  const [retrievedConfig, setRetrievedConfig] = useState(null);  // Store the fetched config

  // Function to add Wi-Fi config
  const addWiFiConfig = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/add-wifi-config', {
        ssid,
      });
      alert(response.data.message);  // Show success message
      setSsid('');  // Clear the form
    } catch (error) {
      console.error('Error adding Wi-Fi configuration:', error);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
          <h1 className="text-2xl font-bold mb-6 text-center">Add Wi-Fi Configuration</h1>
          <form onSubmit={addWiFiConfig} className="space-y-4">
            <div>
              <label htmlFor="ssid" className="block text-sm font-medium text-gray-700">SSID:</label>
              <input
                type="text"
                id="ssid"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={ssid}
                onChange={(e) => setSsid(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              Add Wi-Fi Configuration
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default WiFiConfig;
