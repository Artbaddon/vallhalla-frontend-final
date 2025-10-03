import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getDefaultPathForRole } from '../../constants/navigationConfig';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If allowedRoles is specified, check if user has required role
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.roleId)) {
    const fallback = getDefaultPathForRole(user?.roleId) ?? '/';
    return <Navigate to={fallback} replace />;
  }

  return children;
};

export default ProtectedRoute; 