import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TransactionProvider } from './context/TransactionContext';

import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import TransactionModal from './components/TransactionModal';
import ConfirmModal from './components/ConfirmModal';
import ToastContainer from './components/ToastContainer';

// Business Pages
import Dashboard from './pages/Dashboard';
import SalesPage from './pages/SalesPage';
import ExpensesPage from './pages/ExpensesPage';
import TransactionsPage from './pages/TransactionsPage';
import CustomersPage from './pages/CustomersPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';

// Auth & Access Control Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import SuspendedAccountPage from './pages/SuspendedAccountPage';
import AccessDeniedPage from './pages/AccessDeniedPage';

// Admin Pages
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminAuditLogsPage from './pages/AdminAuditLogsPage';
import AdminReactivationRequestsPage from './pages/AdminReactivationRequestsPage';

// Route Guard for authenticated business users
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, isSuspended, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="fn-loading-screen">
        <div className="fn-spinner" />
        <p>Restoring VyaparFlow secure session...</p>
      </div>
    );
  }

  if (isSuspended && location.pathname !== '/suspended') {
    return <Navigate to="/suspended" replace />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (isAdmin && location.pathname !== '/settings') {
    return <Navigate to="/admin" replace />;
  }

  return children;
};

// Route Guard for Super Administrator
const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, isSuspended, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="fn-loading-screen">
        <div className="fn-spinner" />
        <p>Verifying administrative credentials...</p>
      </div>
    );
  }

  if (isSuspended) {
    return <Navigate to="/suspended" replace />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/access-denied" replace />;
  }

  return children;
};

// App Layout with Sidebar and Navbar
const AppLayout = ({ children }) => (
  <div className="app-container">
    <Sidebar />
    <main className="main-content">
      <Navbar />
      <div className="page-body">{children}</div>
    </main>
    <TransactionModal />
    <ConfirmModal />
    <ToastContainer />
  </div>
);

const App = () => (
  <ThemeProvider>
    <AuthProvider>
      <TransactionProvider>
        <Router>
          <Routes>
            {/* Public Authentication Pages */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/suspended" element={<SuspendedAccountPage />} />
            <Route path="/access-denied" element={<AccessDeniedPage />} />

            {/* Business Management Pages (Protected) */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Dashboard />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/sales"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <SalesPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/expenses"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <ExpensesPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/transactions"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <TransactionsPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/customers"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <CustomersPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <AnalyticsPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <SettingsPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            {/* Super Admin Control Center (Admin Protected) */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AppLayout>
                    <AdminDashboardPage />
                  </AppLayout>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <AdminRoute>
                  <AppLayout>
                    <AdminUsersPage />
                  </AppLayout>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/audit-logs"
              element={
                <AdminRoute>
                  <AppLayout>
                    <AdminAuditLogsPage />
                  </AppLayout>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/reactivation-requests"
              element={
                <AdminRoute>
                  <AppLayout>
                    <AdminReactivationRequestsPage />
                  </AppLayout>
                </AdminRoute>
              }
            />

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </TransactionProvider>
    </AuthProvider>

    <style>{`
      .fn-loading-screen {
        height: 100vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 1rem;
        background: var(--bg-app);
        color: var(--text-muted);
        font-size: 0.875rem;
        font-weight: 500;
      }
      .fn-spinner {
        width: 36px;
        height: 36px;
        border: 3px solid var(--border);
        border-top-color: var(--brand);
        border-radius: 50%;
        animation: fn-spin 0.8s linear infinite;
      }
      @keyframes fn-spin {
        to { transform: rotate(360deg); }
      }
    `}</style>
  </ThemeProvider>
);

export default App;
