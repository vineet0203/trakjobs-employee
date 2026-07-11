import { Navigate, Route, Routes } from 'react-router-dom';
import MainLayout from '../layout/MainLayout';
import Login from '../pages/Login';
import ListingsPage from '../pages/ListingsPage';
import SetPassword from '../pages/SetPassword';
import TimeTracking from '../pages/TimeTracking';
import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';

import VerificationPage from '../pages/VerificationPage';
import VerificationRequired from '../pages/VerificationRequired';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('employee_token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const employee = JSON.parse(localStorage.getItem('employee_auth_employee') || '{}');
  if (employee && employee.verification_status !== 'verified') {
    return <Navigate to="/verification-required" replace />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/employee-login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/set-password" element={<SetPassword />} />
      <Route path="/verification" element={<VerificationPage />} />
      <Route path="/verification-required" element={<VerificationRequired />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/time-tracking" replace />} />
        <Route path="time-tracking" element={<TimeTracking />} />
        <Route path="listings" element={<ListingsPage />} />
        <Route path="dashboard" element={<Navigate to="/time-tracking" replace />} />
      </Route>

      <Route
        path="/"
        element={
          localStorage.getItem('employee_token') ? (
            <Navigate to="/time-tracking" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
