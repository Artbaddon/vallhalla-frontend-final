/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import jwtDecode from 'jwt-decode';
import api, { authAPI } from '../services/apiService';
import toast from 'react-hot-toast';
import { ROLE_IDS, ROLE_NAMES } from '../constants/navigationConfig';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Function to validate token and set user data
  const validateToken = useCallback(async (token) => {
    try {
      // Set token in axios headers
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Call validate-token endpoint
      const response = await authAPI.validateToken();
      
      if (response.status === 200) {
        const decoded = jwtDecode(token);
        const rawRoleId = decoded.roleId ?? decoded.role_id ?? decoded.role ?? null;
        const roleId = rawRoleId != null ? Number(rawRoleId) : null;
        const roleKey =
          roleId === ROLE_IDS.ADMIN
            ? 'ADMIN'
            : roleId === ROLE_IDS.SECURITY
            ? 'SECURITY'
            : roleId === ROLE_IDS.OWNER
            ? 'OWNER'
            : null;

        setUser({
          userId: decoded.userId || decoded.sub,
          username: decoded.username || decoded.name,
          roleId,
          roleKey,
          roleName: ROLE_NAMES[roleId] || decoded.roleName || decoded.role,
        });
        return true;
      }
    } catch (error) {
      console.error('Token validation failed:', error);
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      return false;
    }
    return false;
  }, []);

  useEffect(() => {
    // Check for existing token on app load
    const checkAuth = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          const decoded = jwtDecode(token);
          const currentTime = Date.now() / 1000;
          
          if (decoded.exp > currentTime) {
            // Token is not expired, validate with server
            await validateToken(token);
          } else {
            // Token expired
            localStorage.removeItem('token');
            delete api.defaults.headers.common['Authorization'];
          }
        } catch (error) {
          console.error('Error decoding token:', error);
          localStorage.removeItem('token');
          delete api.defaults.headers.common['Authorization'];
        }
      }
      setLoading(false);
    };
    
    checkAuth();
  }, [validateToken]);

  const login = useCallback(async (username, password) => {
    try {
      setLoading(true);
      const response = await authAPI.login({ username, password });
      
      // Get token from response (could be in response.data or directly in response)
      const token = response.data?.token || response.token;
      
      if (!token) {
        throw new Error('No token received');
      }
      
      // Store token
      localStorage.setItem('token', token);
      
      // Validate token and set user data
      const isValid = await validateToken(token);
      
      if (isValid) {
        toast.success('Inicio de sesión exitoso');
        return { success: true };
      } else {
        throw new Error('Token validation failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      const message = error.response?.data?.message || 'Error al iniciar sesión';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, [validateToken]);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    toast.success('Sesión cerrada exitosamente');
  }, []);

  const updateUser = useCallback((userData) => {
    setUser((prevUser) => {
      const nextRoleId = userData.roleId ?? prevUser?.roleId;
      const roleKey =
        nextRoleId === ROLE_IDS.ADMIN
          ? 'ADMIN'
          : nextRoleId === ROLE_IDS.SECURITY
          ? 'SECURITY'
          : nextRoleId === ROLE_IDS.OWNER
          ? 'OWNER'
          : prevUser?.roleKey ?? null;

      return {
        ...prevUser,
        ...userData,
        roleId: nextRoleId,
        roleKey,
        roleName:
          userData.roleName ?? ROLE_NAMES[nextRoleId] ?? prevUser?.roleName ?? null,
      };
    });
  }, []);
  
  const forgotPassword = useCallback(async (email) => {
    try {
      await authAPI.forgotPassword(email);
      toast.success('Se ha enviado un correo con instrucciones para restablecer su contraseña');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Error al procesar la solicitud';
      toast.error(message);
      return { success: false, error: message };
    }
  }, []);
  
  const resetPassword = useCallback(async (token, newPassword) => {
    try {
      await authAPI.resetPassword(token, newPassword);
      toast.success('Contraseña restablecida exitosamente');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Error al restablecer la contraseña';
      toast.error(message);
      return { success: false, error: message };
    }
  }, []);
  
  const changePassword = useCallback(async (oldPassword, newPassword) => {
    try {
      await authAPI.changePassword(oldPassword, newPassword);
      toast.success('Contraseña actualizada exitosamente');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Error al cambiar la contraseña';
      toast.error(message);
      return { success: false, error: message };
    }
  }, []);

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    user,
    loading,
    login,
    logout,
    updateUser,
    forgotPassword,
    resetPassword,
    changePassword,
    isAuthenticated: !!user,
    isAdmin: user?.roleKey === 'ADMIN',
    isOwner: user?.roleKey === 'OWNER',
    isSecurity: user?.roleKey === 'SECURITY',
  }), [changePassword, forgotPassword, loading, login, logout, resetPassword, updateUser, user]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 