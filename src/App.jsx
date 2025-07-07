import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from 'react-hot-toast';
import HomePage from './pages/HomePage';
import Login from './pages/auth/Login';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/common/ProtectedRoute';

// Admin Pages
import AdminDashboard from './pages/admin/dashboard/AdminDashboard';
import DashboardHome from './pages/admin/DashboardHome';
import Owners from './pages/admin/owners/Owners';
import Tenants from './pages/admin/tenant/Tenants';
import Apartments from './pages/admin/apartments/Apartments';
import Towers from './pages/admin/towers/Towers';
import Payments from './pages/admin/payments/Payments';
import Parking from './pages/admin/parking/Parking';
import Pets from './pages/admin/pets/Pets';
import PQRS from './pages/admin/pqrs/PQRS';
import Reservations from './pages/admin/reservations/Reservations';
import Surveys from './pages/admin/surveys/Surveys';
import Profile from './pages/admin/profile/Profile';
import Guards from './pages/admin/guard/Guards';
import Visitors from './pages/admin/visitors/Visitors';
import Facilities from './pages/admin/facilities/Facilities';
import Notifications from './pages/admin/notifications/Notifications';
import Roles from './pages/admin/roles/Roles';
import Permissions from './pages/admin/permissions/Permissions';

// Owner Pages
import OwnerDashboard from './pages/owner/OwnerDashboard';

// Guard Pages
import GuardDashboard from './pages/guard/GuardDashboard';

import './App.css';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
      staleTime: 30000,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Toaster position="top-right" />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Admin routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin" replace />} />
            <Route path="dashboard" element={<DashboardHome />} />
            <Route path="owners" element={<Owners />} />
            <Route path="tenants" element={<Tenants />} />
            <Route path="apartments" element={<Apartments />} />
            <Route path="towers" element={<Towers />} />
            <Route path="payments" element={<Payments />} />
            <Route path="parking" element={<Parking />} />
            <Route path="pets" element={<Pets />} />
            <Route path="pqrs" element={<PQRS />} />
            <Route path="reservations" element={<Reservations />} />
            <Route path="surveys" element={<Surveys />} />
            <Route path="profile" element={<Profile />} />
            <Route path="guards" element={<Guards />} />
            <Route path="visitors" element={<Visitors />} />
            <Route path="facilities" element={<Facilities />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="roles" element={<Roles />} />
            <Route path="permissions" element={<Permissions />} />
          </Route>

          {/* Owner routes */}
          <Route
            path="/owner"
            element={
              <ProtectedRoute>
                <OwnerDashboard />
              </ProtectedRoute>
            }
          >
            {/* Owner subroutes */}
          </Route>

          {/* Guard routes */}
          <Route
            path="/guard"
            element={
              <ProtectedRoute>
                <GuardDashboard />
              </ProtectedRoute>
            }
          >
            {/* Guard subroutes */}
          </Route>

          {/* 404 route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
