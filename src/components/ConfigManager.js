import React, { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import axios from 'axios';
import Swal from 'sweetalert2';
import DashboardLayout from './Dashboard/DashboardLayout';

const ConfigManager = () => {
  const [activeForm, setActiveForm] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [ssid, setSsid] = useState('');
  const [qrCodeImage, setQrCodeImage] = useState('');
  const [entries, setEntries] = useState([]);
  const qrRef = useRef(null);

  const handleSelectForm = (type) => {
    setActiveForm(type);
    setCompanyName('');
    setSsid('');
    setQrCodeImage('');
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [qrRes, wifiRes] = await Promise.all([
          axios.get('http://localhost:5000/api/get-all-qr-codes'),
          axios.get('http://localhost:5000/api/get-all-wifi-configs')
        ]);

        const qrEntries = qrRes.data.qrCodes.map(qr => ({
          type: 'QR Code',
          name: qr.qrCodeData.replace('Company: ', ''),
          image: qr.qrCodeImage // Make sure backend includes this
        }));

        const wifiEntries = wifiRes.data.map(wifi => ({
          type: 'Wi-Fi SSID',
          name: wifi.ssid
        }));

        setEntries([...qrEntries, ...wifiEntries]);
      } catch (error) {
        console.error('Error loading configs:', error);
      }
    };

    fetchData();
  }, []);

  const generateQRCode = async (e) => {
    e.preventDefault();
    const res = await axios.post('http://localhost:5000/api/generate-qr', { companyName });
    setQrCodeImage(res.data.qrCodeImage);
    await Swal.fire({
      title: 'QR Code Created!',
      text: 'New QR code has been created.',
      icon: 'success',
      confirmButtonColor: '#6366F1',
      background: document.documentElement.classList.contains('dark') ? '#1f2937' : '#fff',
      color: document.documentElement.classList.contains('dark') ? '#fff' : '#000'
    });
  };

  const addWiFiConfig = async (e) => {
    e.preventDefault();
    await axios.post('http://localhost:5000/api/add-wifi-config', { ssid });
    setSsid('');
    await Swal.fire({
      title: 'Copied!',
      text: 'SSID copied to clipboard.',
      icon: 'success',
      confirmButtonColor: '#6366F1',
      background: document.documentElement.classList.contains('dark') ? '#1f2937' : '#fff',
      color: document.documentElement.classList.contains('dark') ? '#fff' : '#000'
    });
  };

  const downloadQRCode = async () => {
    const canvas = await html2canvas(qrRef.current);
    const imgData = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = imgData;
    link.download = `${companyName}.png`;
    link.click();
  };

  return (
    <DashboardLayout>
      <div className="p-8 bg-gray-100 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-white">
        <h1 className="text-2xl font-bold mb-4">Create Configuration</h1>

        <div className="mb-6">
          <select
            className="border border-gray-300 dark:border-gray-700 rounded px-3 py-2 bg-white dark:bg-gray-800 dark:text-white"
            onChange={(e) => handleSelectForm(e.target.value)}
            defaultValue=""
          >
            <option value="" disabled>Select type...</option>
            <option value="qr">Generate QR Code</option>
            <option value="ssid">Add Wi-Fi SSID</option>
          </select>
        </div>

        {activeForm === 'qr' && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded shadow max-w-md">
            <form onSubmit={generateQRCode}>
              <label className="block mb-2">Company Name:</label>
              <input
                type="text"
                className="border px-3 py-2 w-full rounded mb-4 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
              />
              <button className="bg-[#209ACF] text-white px-4 py-2 rounded w-full">Generate QR Code</button>
            </form>

            {qrCodeImage && (
              <div className="text-center mt-6">
                <h3 className="mb-2 font-semibold">QR Code Preview:</h3>
                <div ref={qrRef} className="inline-block p-4 border bg-white dark:bg-gray-700">
                  <img src={qrCodeImage} alt="QR Code" />
                </div>
                <button onClick={downloadQRCode} className="mt-4 bg-green-600 text-white px-4 py-2 rounded">
                  Download for Print
                </button>
              </div>
            )}
          </div>
        )}

        {activeForm === 'ssid' && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded shadow max-w-md">
            <form onSubmit={addWiFiConfig}>
              <label className="block mb-2">SSID:</label>
              <input
                type="text"
                className="border px-3 py-2 w-full rounded mb-4 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={ssid}
                onChange={(e) => setSsid(e.target.value)}
                required
              />
              <button className="bg-[#209ACF] text-white px-4 py-2 rounded w-full">Add Wi-Fi Configuration</button>
            </form>
          </div>
        )}

        <div className="mt-12">
          <h2 className="text-xl font-semibold mb-4">Created Configurations</h2>
          <table className="w-full border dark:border-gray-700">
            <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-white">
              <tr>
                <th className="text-left p-2 border dark:border-gray-700">#</th>
                <th className="text-left p-2 border dark:border-gray-700">Type</th>
                <th className="text-left p-2 border dark:border-gray-700">Preview</th>
                <th className="text-left p-2 border dark:border-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, idx) => (
                <tr key={idx} className="border-t dark:border-gray-700">
                  <td className="p-2 border dark:border-gray-700">{idx + 1}</td>
                  <td className="p-2 border dark:border-gray-700">{entry.type}</td>
                  <td className="p-2 border dark:border-gray-700">
                    {entry.type === 'QR Code' ? (
                      <img src={entry.image} alt="QR Preview" className="w-12 h-12" />
                    ) : (
                      entry.name
                    )}
                  </td>
                  <td className="p-2 border dark:border-gray-700">
                    {entry.type === 'QR Code' ? (
                      <button
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = entry.image;
                          link.download = `${entry.name}.png`;
                          link.click();
                        }}
                        className="bg-blue-500 text-white px-4 py-1 rounded"
                      >
                        Download
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(entry.name);
                          Swal.fire({
                            title: 'Copied!',
                            text: 'SSID copied to clipboard.',
                            icon: 'success',
                            confirmButtonColor: '#6366F1',
                            background: document.documentElement.classList.contains('dark') ? '#1f2937' : '#fff',
                            color: document.documentElement.classList.contains('dark') ? '#fff' : '#000'
                          });
                        }}
                        className="bg-blue-500 text-white px-4 py-1 rounded"
                      >
                        Copy
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {entries.length === 0 && (
                <tr>
                  <td colSpan="4" className="p-4 text-center text-gray-500 dark:text-gray-400">
                    No entries yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ConfigManager;
