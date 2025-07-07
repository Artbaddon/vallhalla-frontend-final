import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/auth/Login';
import AdminDashboard from './pages/admin/AdminDashboard';
import OwnerDashboard from './pages/owner/OwnerDashboard';
import GuardDashboard from './pages/guard/GuardDashboard';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/common/ProtectedRoute';
import './App.css';

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      
      {/* Protected routes */}
      <Route path="/" element={
        <ProtectedRoute>
          {user?.roleId === 1 ? <AdminDashboard /> : 
           user?.roleId === 3 ? <OwnerDashboard /> : 
           user?.roleId === 4 ? <GuardDashboard /> : 
           <Navigate to="/login" replace />}
        </ProtectedRoute>
      } />
      
      {/* Admin routes */}
      <Route path="/admin/*" element={
        <ProtectedRoute allowedRoles={[1]}>
          <AdminDashboard />
        </ProtectedRoute>
      } />
      
      {/* Owner routes */}
      <Route path="/owner/*" element={
        <ProtectedRoute allowedRoles={[3]}>
          <OwnerDashboard />
        </ProtectedRoute>
      } />
      
      {/* Guard routes */}
      <Route path="/guard/*" element={
        <ProtectedRoute allowedRoles={[4]}>
          <GuardDashboard />
        </ProtectedRoute>
      } />
      
      {/* Catch all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <AppRoutes />
      </div>
    </AuthProvider>
  );
}

export default App; 