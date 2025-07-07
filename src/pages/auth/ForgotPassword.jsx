import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import './Login.css';

const ForgotPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { forgotPassword } = useAuth();
  
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const result = await forgotPassword(data.email);
      if (result.success) {
        setEmailSent(true);
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      toast.error('Error al procesar la solicitud. Por favor, inténtelo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-title">VALHALLA</h1>
          <p className="login-subtitle">Recuperación de Contraseña</p>
        </div>

        {emailSent ? (
          <div className="text-center p-4">
            <i className="bi bi-check-circle-fill text-success fs-1 mb-3"></i>
            <h4>Correo enviado</h4>
            <p className="mb-4">
              Se han enviado instrucciones para restablecer su contraseña al correo proporcionado.
              Por favor, revise su bandeja de entrada.
            </p>
            <Link to="/login" className="btn btn-primary">
              Volver a Inicio de Sesión
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="login-form">
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Correo Electrónico
              </label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-envelope"></i>
                </span>
                <input
                  type="email"
                  id="email"
                  className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                  placeholder="Ingrese su correo electrónico"
                  {...register('email', {
                    required: 'El correo electrónico es requerido',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Dirección de correo inválida'
                    }
                  })}
                />
              </div>
              {errors.email && (
                <div className="invalid-feedback d-block">
                  {errors.email.message}
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
                    Enviando...
                  </>
                ) : (
                  'Enviar Instrucciones'
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

export default ForgotPassword; 