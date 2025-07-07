import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, isAdmin, isOwner, isSecurity, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If allowedRoles is specified, check if user has required role
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.roleId)) {
    // Redirect based on user role
    if (isAdmin) {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (isOwner) {
      return <Navigate to="/owner/dashboard" replace />;
    } else if (isSecurity) {
      return <Navigate to="/guard/dashboard" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute; 