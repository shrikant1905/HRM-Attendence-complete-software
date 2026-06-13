import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Layout from './components/Layout';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import Employees from './pages/admin/Employees';
import Attendance from './pages/admin/Attendance';
import LiveMonitor from './pages/admin/LiveMonitor';
import Payroll from './pages/admin/Payroll';
import Reports from './pages/admin/Reports';
import Invoices from './pages/admin/Invoices';
import Settings from './pages/admin/Settings';
// Employee Pages
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import MyAttendance from './pages/employee/MyAttendance';
import MySalary from './pages/employee/MySalary';

// Shared Pages
import Profile from './pages/shared/Profile';

import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>

      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<Layout type="admin"><AdminDashboard /></Layout>} />
        <Route path="/admin/employees" element={<Layout type="admin"><Employees /></Layout>} />
        <Route path="/admin/attendance" element={<Layout type="admin"><Attendance /></Layout>} />
        <Route path="/admin/live" element={<Layout type="admin"><LiveMonitor /></Layout>} />
        <Route path="/admin/payroll" element={<Layout type="admin"><Payroll /></Layout>} />
        <Route path="/admin/reports" element={<Layout type="admin"><Reports /></Layout>} />
        <Route path="/admin/invoices" element={<Layout type="admin"><Invoices /></Layout>} />
        <Route path="/admin/settings" element={<Layout type="admin"><Settings /></Layout>} />
        <Route path="/admin/profile" element={<Layout type="admin"><Profile type="admin" /></Layout>} />

        {/* Employee Routes */}
        <Route path="/employee" element={<Layout type="employee"><EmployeeDashboard /></Layout>} />
        <Route path="/employee/attendance" element={<Layout type="employee"><MyAttendance /></Layout>} />
        <Route path="/employee/salary" element={<Layout type="employee"><MySalary /></Layout>} />
        <Route path="/employee/reports" element={<Layout type="employee"><Reports /></Layout>} />
        <Route path="/employee/profile" element={<Layout type="employee"><Profile type="employee" /></Layout>} />

        {/* Default Redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
