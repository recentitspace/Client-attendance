// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import SignIn from './components/Auth/SignIn';
import SignUp from './components/Auth/SignUp';
import ForgotPassword from './components/Auth/ForgetPassword';
import Dashboard from './components/Dashboard/Dashboard';
import EmployeeManagement from './components/Employee/EmployeeManagement';
import AttendanceManagement from './components/Attendance/AttendanceManagement';
import LeaveRequests from './components/Leave_request/LeaveRequests';
import ReportsPage from './components/Reports/Report';
import AdminAnnouncementsPage from './components/Announcements/Announcement';
import QRGenerator from './components/Qr_code/QrCode';
import TimeTableApp from './components/Timetable/TimeTableManagement';
import WifiConfig from './components/SSID/Ssid';
import TimetableForm from './components/Timetable/TimeTableForm'; 
import { ThemeProvider } from "@material-tailwind/react";
import TimetableDetails from './components/Timetable/TimetableDisplay';
import ConfigManager from './components/ConfigManager';
function App() {
  return (
    <div className="min-h-screen bg-gray-100">
       <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/employees" element={<EmployeeManagement />} />
          <Route path="/attendance" element={<AttendanceManagement />} />
          <Route path="/leave-requests" element={<LeaveRequests />} />
          <Route path="/timetable" element={<TimeTableApp />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/qrcode" element={<QRGenerator />} />
          <Route path="/config" element={<ConfigManager />} />
          <Route path="/form" element={<TimetableForm />} />
          <Route path="/announcements" element={<AdminAnnouncementsPage />} />
          <Route path="/timetables/:id" element={<TimetableDetails />} />

        </Routes>
      </Router>
      </ThemeProvider>
    </div>
  );
}

export default App;
