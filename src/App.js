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
import TimetableDetails from './components/Timetable/TimetableDisplay';
import ConfigManager from './components/ConfigManager';
import HolidayManager from './components/Holiday/holiday';
import ProfilePage from './components/Profile/ProfilePage';

import { ThemeProvider as MaterialTailwindProvider } from "@material-tailwind/react";
import { ThemeProvider } from './components/Context/ThemeContext';

import PrivateRoute from './components/Auth/PrivateRoute';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 dark:text-white">
      <ThemeProvider>
        <MaterialTailwindProvider>
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              {/* Redirect root path */}
              <Route
                path="/"
                element={
                  localStorage.getItem("token")
                    ? <Navigate to="/dashboard" />
                    : <Navigate to="/login" />
                }
              />

              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />

              <Route
                path="/profile"
                element={
                  <PrivateRoute>
                    <ProfilePage />
                  </PrivateRoute>
                }
              />

              <Route
                path="/employees"
                element={
                  <PrivateRoute>
                    <EmployeeManagement />
                  </PrivateRoute>
                }
              />

              <Route
                path="/attendance"
                element={
                  <PrivateRoute>
                    <AttendanceManagement />
                  </PrivateRoute>
                }
              />

              <Route
                path="/leave-requests"
                element={
                  <PrivateRoute>
                    <LeaveRequests />
                  </PrivateRoute>
                }
              />

              <Route
                path="/timetable"
                element={
                  <PrivateRoute>
                    <TimeTableApp />
                  </PrivateRoute>
                }
              />

              <Route
                path="/reports"
                element={
                  <PrivateRoute>
                    <ReportsPage />
                  </PrivateRoute>
                }
              />

              <Route
                path="/qrcode"
                element={
                  <PrivateRoute>
                    <QRGenerator />
                  </PrivateRoute>
                }
              />

              <Route
                path="/config"
                element={
                  <PrivateRoute>
                    <ConfigManager />
                  </PrivateRoute>
                }
              />

              <Route
                path="/form"
                element={
                  <PrivateRoute>
                    <TimetableForm />
                  </PrivateRoute>
                }
              />

              <Route
                path="/announcements"
                element={
                  <PrivateRoute>
                    <AdminAnnouncementsPage />
                  </PrivateRoute>
                }
              />

              <Route
                path="/timetables/:id"
                element={
                  <PrivateRoute>
                    <TimetableDetails />
                  </PrivateRoute>
                }
              />

              <Route
                path="/holiday"
                element={
                  <PrivateRoute>
                    <HolidayManager />
                  </PrivateRoute>
                }
              />

              <Route
                path="/ssid"
                element={
                  <PrivateRoute>
                    <WifiConfig />
                  </PrivateRoute>
                }
              />

            </Routes>
          </Router>
        </MaterialTailwindProvider>
      </ThemeProvider>
    </div>
  );
}

export default App;
