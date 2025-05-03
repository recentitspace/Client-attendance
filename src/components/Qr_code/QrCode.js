import React, { useState, useRef } from 'react';
import axios from 'axios';
import html2canvas from 'html2canvas';
import DashboardLayout from '../Dashboard/DashboardLayout';

const QRGenerator = () => {
  const [companyName, setCompanyName] = useState('');  // For inputting company name
  const [qrCodeImage, setQrCodeImage] = useState('');  // Store the QR code image from the backend
  const qrRef = useRef(null);  // Reference for the QR code element for downloading

  // Function to send company name to backend and generate the QR code
  const generateQRCode = async (e) => {
    e.preventDefault();
    try {
      // Send a POST request to the backend to generate the QR code with the company name
      const response = await axios.post('http://localhost:5000/api/generate-qr', { companyName });
      
      // Set the generated QR code image from the backend in the state
      setQrCodeImage(response.data.qrCodeImage);  // QR code image as a Data URL
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  // Function to download the QR code as an image using html2canvas
  const downloadQRCode = async () => {
    if (!qrRef.current) return;  // Ensure there's something to download

    // Capture the QR code using html2canvas to download it as an image
    const canvas = await html2canvas(qrRef.current);
    const imgData = canvas.toDataURL('image/png');

    // Create a temporary link element to download the QR code
    const link = document.createElement('a');
    link.href = imgData;
    link.download = 'company-qr-code.png';
    link.click();  // Programmatically click the link to trigger download
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
          <h1 className="text-2xl font-bold mb-6 text-center">Generate Company QR Code</h1>
          <form onSubmit={generateQRCode} className="space-y-4">
            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">Company Name:</label>
              <input
                type="text"
                id="companyName"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              Generate QR Code
            </button>
          </form>

          {qrCodeImage && (
            <div className="mt-8 text-center">
              <h2 className="text-lg font-semibold">Your Company QR Code:</h2>
              {/* Display the QR code image received from the backend */}
              <div ref={qrRef} className="mt-4 bg-white p-4 flex justify-center">
                <img src={qrCodeImage} alt="QR Code" className="border border-gray-300 p-2" />  {/* Show QR code */}
              </div>
              <button
                className="mt-4 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
                onClick={downloadQRCode}
              >
                Download for Print
              </button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default QRGenerator;
