import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import './Login.css';

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated, isAdmin, isOwner, isSecurity } = useAuth();
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      redirectBasedOnRole();
    }
  }, [isAuthenticated]);

  const redirectBasedOnRole = () => {
    if (isAdmin) {
      navigate('/admin');
    } else if (isOwner) {
      navigate('/owner/dashboard');
    } else if (isSecurity) {
      navigate('/guard/dashboard');
    } else {
      navigate('/');
    }
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const result = await login(data.username, data.password);
      if (result.success) {
        // Redirect will be handled by the useEffect
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Error al iniciar sesión. Por favor, inténtelo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-title">VALHALLA</h1>
          <p className="login-subtitle">Sistema de Administración de Propiedades</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="login-form">
          <div className="form-group">
            <label htmlFor="username" className="form-label">
              Usuario
            </label>
            <div className="input-group">
              <span className="input-group-text">
                <i className="bi bi-person"></i>
              </span>
              <input
                type="text"
                id="username"
                className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                placeholder="Ingrese su usuario"
                {...register('username', {
                  required: 'El usuario es requerido',
                  minLength: {
                    value: 3,
                    message: 'El usuario debe tener al menos 3 caracteres'
                  }
                })}
              />
            </div>
            {errors.username && (
              <div className="invalid-feedback d-block">
                {errors.username.message}
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Contraseña
            </label>
            <div className="input-group">
              <span className="input-group-text">
                <i className="bi bi-lock"></i>
              </span>
              <input
                type="password"
                id="password"
                className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                placeholder="Ingrese su contraseña"
                {...register('password', {
                  required: 'La contraseña es requerida',
                  minLength: {
                    value: 6,
                    message: 'La contraseña debe tener al menos 6 caracteres'
                  }
                })}
              />
            </div>
            {errors.password && (
              <div className="invalid-feedback d-block">
                {errors.password.message}
              </div>
            )}
          </div>

          <div className="form-group">
            <button
              type="submit"
              className="btn btn-primary w-100 login-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Iniciando sesión...
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </div>

          <div className="form-group text-center">
            <Link to="/forgot-password" className="text-decoration-none">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
        </form>

        <div className="login-footer">
          <p className="text-muted mb-0">
            © 2024 VALHALLA. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login; 