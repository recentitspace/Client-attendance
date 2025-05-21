import React, { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import axios from 'axios';
import Swal from 'sweetalert2';
import DashboardLayout from './Dashboard/DashboardLayout';
import { QrCodeIcon, WifiIcon, PlusIcon, ArrowDownTrayIcon, ClipboardIcon, TrashIcon } from '@heroicons/react/24/outline';
const baseURL = process.env.REACT_APP_API_BASE;

const ConfigManager = () => {
  const [activeForm, setActiveForm] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [ssid, setSsid] = useState('');
  const [qrCodeImage, setQrCodeImage] = useState('');
  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const qrRef = useRef(null);

  const handleSelectForm = (type) => {
    setActiveForm(type);
    setCompanyName('');
    setSsid('');
    setQrCodeImage('');
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    const token = localStorage.getItem('token');
    try {
      const [qrRes, wifiRes] = await Promise.all([
        axios.get(`${baseURL}api/qr-codes/all`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${baseURL}api/wifi-config/all`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const qrEntries = qrRes.data.qrCodes.map(qr => ({
        type: 'QR Code',
        id: qr._id, // Store the ID
        name: qr.qrCodeData.replace('Company: ', ''),
        image: qr.qrCodeImage,
        createdAt: qr.createdAt || new Date().toISOString()
      }));

      const wifiEntries = wifiRes.data.map(wifi => ({
        type: 'Wi-Fi SSID',
        id: wifi._id, // Store the ID
        name: wifi.ssid,
        createdAt: wifi.createdAt || new Date().toISOString()
      }));

      setEntries([...qrEntries, ...wifiEntries].sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      ));
    } catch (error) {
      console.error('Error loading configs:', error);
      const theme = localStorage.getItem('theme') || 'light';
      Swal.fire({
        title: 'Error',
        text: 'Failed to load configurations',
        icon: 'error',
        confirmButtonColor: '#209ACF',
        background: theme === 'dark' ? '#1f2937' : '#ffffff',
        color: theme === 'dark' ? '#f9fafb' : '#1f2937'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateQRCode = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const token = localStorage.getItem('token');
    try {
      const res = await axios.post(`${baseURL}api/qr-codes/generate`, 
        { companyName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const theme = localStorage.getItem('theme') || 'light';
      await Swal.fire({
        title: 'Success!',
        text: 'QR Code has been created successfully',
        icon: 'success',
        confirmButtonColor: '#209ACF',
        background: theme === 'dark' ? '#1f2937' : '#ffffff',
        color: theme === 'dark' ? '#f9fafb' : '#1f2937',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false
      });
      
      fetchData();
      // Reset the form and active form state
      setCompanyName('');
      setQrCodeImage('');
      setActiveForm('');
    } catch (error) {
      console.error('Error generating QR code:', error);
      const theme = localStorage.getItem('theme') || 'light';
      Swal.fire({
        title: 'Error',
        text: 'Failed to generate QR code',
        icon: 'error',
        confirmButtonColor: '#209ACF',
        background: theme === 'dark' ? '#1f2937' : '#ffffff',
        color: theme === 'dark' ? '#f9fafb' : '#1f2937'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addWiFiConfig = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const token = localStorage.getItem('token');
    try {
      await axios.post(`${baseURL}api/wifi-config/add`, 
        { ssid },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const theme = localStorage.getItem('theme') || 'light';
      await Swal.fire({
        title: 'Success!',
        text: 'Wi-Fi configuration has been added',
        icon: 'success',
        confirmButtonColor: '#209ACF',
        background: theme === 'dark' ? '#1f2937' : '#ffffff',
        color: theme === 'dark' ? '#f9fafb' : '#1f2937',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false
      });
      
      fetchData();
      // Reset the form and active form state
      setSsid('');
      setActiveForm('');
    } catch (error) {
      console.error('Error adding Wi-Fi config:', error);
      const theme = localStorage.getItem('theme') || 'light';
      Swal.fire({
        title: 'Error',
        text: 'Failed to add Wi-Fi configuration',
        icon: 'error',
        confirmButtonColor: '#209ACF',
        background: theme === 'dark' ? '#1f2937' : '#ffffff',
        color: theme === 'dark' ? '#f9fafb' : '#1f2937'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const downloadQRCode = async () => {
    try {
      const canvas = await html2canvas(qrRef.current);
      const imgData = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = imgData;
      link.download = `${companyName}.png`;
      link.click();
      
      const theme = localStorage.getItem('theme') || 'light';
      Swal.fire({
        title: 'Downloaded!',
        text: 'QR Code has been downloaded',
        icon: 'success',
        confirmButtonColor: '#209ACF',
        background: theme === 'dark' ? '#1f2937' : '#ffffff',
        color: theme === 'dark' ? '#f9fafb' : '#1f2937',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error downloading QR code:', error);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      
      const theme = localStorage.getItem('theme') || 'light';
      Swal.fire({
        title: 'Copied!',
        text: 'SSID copied to clipboard',
        icon: 'success',
        confirmButtonColor: '#209ACF',
        background: theme === 'dark' ? '#1f2937' : '#ffffff',
        color: theme === 'dark' ? '#f9fafb' : '#1f2937',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  const deleteConfig = async (type, id, name) => {
    const theme = localStorage.getItem('theme') || 'light';
    const token = localStorage.getItem('token');
    
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626', // red
      cancelButtonColor: '#209ACF',  // primary color
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      background: theme === 'dark' ? '#1f2937' : '#ffffff',
      color: theme === 'dark' ? '#f9fafb' : '#1f2937',
      borderRadius: '0.5rem',
    });

    if (result.isConfirmed) {
      try {
        if (type === 'QR Code') {
          await axios.delete(`${baseURL}api/qr-codes/delete/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
        } else if (type === 'Wi-Fi SSID') {
          // For WiFi config, we need to send the SSID in the request body
          await axios.delete(`${baseURL}api/wifi-config/delete`, {
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            data: { ssid: name } // Send the SSID in the request body
          });
        }
        
        Swal.fire({
          title: 'Deleted!',
          text: `${type} has been deleted successfully!`,
          icon: 'success',
          confirmButtonColor: '#209ACF', // primary color
          background: theme === 'dark' ? '#1f2937' : '#ffffff',
          color: theme === 'dark' ? '#f9fafb' : '#1f2937',
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false
        });
        
        fetchData();
      } catch (error) {
        console.error(`Error deleting ${type}:`, error);
        Swal.fire({
          title: 'Error!',
          text: `Failed to delete the ${type}.`,
          icon: 'error',
          confirmButtonColor: '#209ACF',
          background: theme === 'dark' ? '#1f2937' : '#ffffff',
          color: theme === 'dark' ? '#f9fafb' : '#1f2937',
        });
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-primary p-2 rounded-lg">
              <QrCodeIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Configuration Manager</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Generate QR codes and manage Wi-Fi configurations</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Form Section */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-5 border-b border-gray-200 dark:border-gray-700">
                <h2 className="font-semibold text-gray-800 dark:text-white text-lg">Create New Configuration</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Select a configuration type to create</p>
              </div>
              
              <div className="p-5">
                <div className="flex space-x-3 mb-6">
                  <button
                    onClick={() => handleSelectForm('qr')}
                    className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all ${
                      activeForm === 'qr' 
                        ? 'bg-primary text-white shadow-md' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    <QrCodeIcon className="h-5 w-5" />
                    <span>QR Code</span>
                  </button>
                  
                  <button
                    onClick={() => handleSelectForm('ssid')}
                    className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all ${
                      activeForm === 'ssid' 
                        ? 'bg-primary text-white shadow-md' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    <WifiIcon className="h-5 w-5" />
                    <span>Wi-Fi SSID</span>
                  </button>
                </div>

                {activeForm === 'qr' && (
                  <div className="animate-fade-in-down">
                    <form onSubmit={generateQRCode} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Company Name*
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          placeholder="Enter company name"
                          required
                        />
                      </div>
                      
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-primary hover:bg-primary/90 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-70"
                      >
                        {isLoading ? (
                          <>
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Generating...</span>
                          </>
                        ) : (
                          <>
                            <QrCodeIcon className="h-5 w-5" />
                            <span>Generate QR Code</span>
                          </>
                        )}
                      </button>
                    </form>

                    {qrCodeImage && (
                      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <h3 className="text-center font-medium text-gray-800 dark:text-white mb-3">QR Code Preview</h3>
                        <div className="flex justify-center">
                          <div ref={qrRef} className="bg-white p-4 rounded-lg shadow-sm">
                            <img src={qrCodeImage} alt="QR Code" className="w-40 h-40" />
                          </div>
                        </div>
                        <button
                          onClick={downloadQRCode}
                          className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                        >
                          <ArrowDownTrayIcon className="h-5 w-5" />
                          <span>Download QR Code</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {activeForm === 'ssid' && (
                  <div className="animate-fade-in-down">
                    <form onSubmit={addWiFiConfig} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Wi-Fi SSID*
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          value={ssid}
                          onChange={(e) => setSsid(e.target.value)}
                          placeholder="Enter Wi-Fi SSID"
                          required
                        />
                      </div>
                      
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-primary hover:bg-primary/90 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-70"
                      >
                        {isLoading ? (
                          <>
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Adding...</span>
                          </>
                        ) : (
                          <>
                            <WifiIcon className="h-5 w-5" />
                            <span>Add Wi-Fi Configuration</span>
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                )}

                {!activeForm && (
                  <div className="text-center py-8">
                    <div className="flex justify-center mb-4">
                      <PlusIcon className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                    </div>
                    <h3 className="text-gray-600 dark:text-gray-300 mb-2">Select a configuration type</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Choose QR Code or Wi-Fi SSID from the options above</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Configurations List */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-5 border-b border-gray-200 dark:border-gray-700">
                <h2 className="font-semibold text-gray-800 dark:text-white text-lg">Saved Configurations</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">All your QR codes and Wi-Fi configurations</p>
              </div>
              
              <div className="overflow-x-auto">
                {isLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                ) : entries.length > 0 ? (
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Created At</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {entries.map((entry, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'}>
                          <td className="p-4 border dark:border-gray-700">
                            <div className="flex items-center">
                              {entry.type === 'QR Code' ? (
                                <QrCodeIcon className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
                              ) : (
                                <WifiIcon className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
                              )}
                              <span className="text-gray-800 dark:text-white">{entry.type}</span>
                            </div>
                          </td>
                          <td className="p-4 border dark:border-gray-700">
                            {entry.type === 'QR Code' ? (
                              <div className="flex items-center">
                                <img src={entry.image} alt="QR Code" className="w-10 h-10 mr-2" />
                                <span className="text-gray-800 dark:text-white">{entry.name}</span>
                              </div>
                            ) : (
                              <span className="text-gray-800 dark:text-white">{entry.name}</span>
                            )}
                          </td>
                          <td className="p-4 border dark:border-gray-700">
                            <span className="text-gray-600 dark:text-gray-400">{new Date(entry.createdAt).toLocaleString()}</span>
                          </td>
                          <td className="p-4 border dark:border-gray-700">
                            <div className="flex space-x-2">
                              {entry.type === 'QR Code' ? (
                                <button
                                  onClick={() => {
                                    const link = document.createElement('a');
                                    link.href = entry.image;
                                    link.download = `${entry.name}.png`;
                                    link.click();
                                  }}
                                  className="bg-primary hover:bg-primary/90 text-white px-3 py-1 rounded-md text-sm flex items-center gap-1 transition-colors"
                                >
                                  <ArrowDownTrayIcon className="h-4 w-4" />
                                  Download
                                </button>
                              ) : (
                                <button
                                  onClick={() => copyToClipboard(entry.name)}
                                  className="bg-primary hover:bg-primary/90 text-white px-3 py-1 rounded-md text-sm flex items-center gap-1 transition-colors"
                                >
                                  <ClipboardIcon className="h-4 w-4" />
                                  Copy
                                </button>
                              )}
                              <button
                                onClick={() => deleteConfig(entry.type, entry.id, entry.name)}
                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm flex items-center gap-1 transition-colors"
                              >
                                <TrashIcon className="h-4 w-4" />
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-8 text-center">
                    <h3 className="text-gray-600 dark:text-gray-300 mb-2">No Configurations Found</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">You haven't created any configurations yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ConfigManager;
