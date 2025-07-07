import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import './Login.css';

const ResetPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [resetComplete, setResetComplete] = useState(false);
  const { resetPassword } = useAuth();
  const { token } = useParams();
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm();

  const password = watch('password', '');

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const result = await resetPassword(token, data.password);
      if (result.success) {
        setResetComplete(true);
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (error) {
      console.error('Reset password error:', error);
      toast.error('Error al restablecer la contraseña. Por favor, inténtelo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-title">VALHALLA</h1>
          <p className="login-subtitle">Restablecer Contraseña</p>
        </div>

        {resetComplete ? (
          <div className="text-center p-4">
            <i className="bi bi-check-circle-fill text-success fs-1 mb-3"></i>
            <h4>¡Contraseña restablecida!</h4>
            <p className="mb-4">
              Su contraseña ha sido restablecida exitosamente.
              Será redirigido a la página de inicio de sesión en unos segundos.
            </p>
            <Link to="/login" className="btn btn-primary">
              Ir a Inicio de Sesión
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="login-form">
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Nueva Contraseña
              </label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-lock"></i>
                </span>
                <input
                  type="password"
                  id="password"
                  className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                  placeholder="Ingrese su nueva contraseña"
                  {...register('password', {
                    required: 'La contraseña es requerida',
                    minLength: {
                      value: 8,
                      message: 'La contraseña debe tener al menos 8 caracteres'
                    },
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                      message: 'La contraseña debe contener al menos una letra mayúscula, una minúscula, un número y un carácter especial'
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
              <label htmlFor="confirmPassword" className="form-label">
                Confirmar Contraseña
              </label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-lock-fill"></i>
                </span>
                <input
                  type="password"
                  id="confirmPassword"
                  className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                  placeholder="Confirme su nueva contraseña"
                  {...register('confirmPassword', {
                    required: 'Debe confirmar la contraseña',
                    validate: value => value === password || 'Las contraseñas no coinciden'
                  })}
                />
              </div>
              {errors.confirmPassword && (
                <div className="invalid-feedback d-block">
                  {errors.confirmPassword.message}
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
                    Procesando...
                  </>
                ) : (
                  'Restablecer Contraseña'
                )}
              </button>
            </div>

            <div className="form-group text-center">
              <Link to="/login" className="text-decoration-none">
                Volver a Inicio de Sesión
              </Link>
            </div>
          </form>
        )}

        <div className="login-footer">
          <p className="text-muted mb-0">
            © 2024 VALHALLA. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword; 