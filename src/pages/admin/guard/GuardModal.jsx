import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Modal from 'react-modal';
import './GuardModal.css';

// Set modal app element for accessibility
Modal.setAppElement('#root');

const GuardModal = ({ show, onHide, onSubmit, guard, isLoading }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue
  } = useForm();

  useEffect(() => {
    setIsOpen(show);
    if (show && guard) {
      // Populate form for editing
      setValue('username', guard.username || '');
      setValue('password', ''); // Don't populate password for security
      setValue('fullName', guard.fullName || '');
      setValue('documentType', guard.documentType || 'CC');
      setValue('documentNumber', guard.documentNumber || '');
      setValue('telephoneNumber', guard.telephoneNumber || '');
      setValue('arl', guard.arl || '');
      setValue('eps', guard.eps || '');
      setValue('shift', guard.shift || 'Morning');
    } else if (show) {
      // Reset form for creating
      reset();
      setValue('documentType', 'CC');
      setValue('shift', 'Morning');
    }
  }, [show, guard, setValue, reset]);

  const handleClose = () => {
    setIsOpen(false);
    reset();
    onHide();
  };

  const onSubmitForm = (data) => {
    // Format data to match API requirements
    const formattedData = {
      username: data.username,
      password: data.password,
      fullName: data.fullName,
      documentType: data.documentType,
      documentNumber: data.documentNumber,
      telephoneNumber: data.telephoneNumber,
      arl: data.arl,
      eps: data.eps,
      shift: data.shift,
      photo: null
    };
    
    onSubmit(formattedData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleClose}
      className="guard-modal"
      overlayClassName="modal-overlay"
      contentLabel={guard ? "Editar Vigilante" : "Nuevo Vigilante"}
    >
      <div className="modal-header">
        <h5 className="modal-title">
          {guard ? 'Editar Vigilante' : 'Nuevo Vigilante'}
        </h5>
        <button
          type="button"
          className="btn-close"
          onClick={handleClose}
          aria-label="Close"
        ></button>
      </div>

      <form onSubmit={handleSubmit(onSubmitForm)}>
        <div className="modal-body">
          <h6 className="form-section-title">Información de Cuenta</h6>
          <div className="row">
            <div className="col-md-6">
              <div className="form-group">
                <label htmlFor="username" className="form-label">
                  Nombre de Usuario <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  id="username"
                  className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                  {...register('username', {
                    required: 'El nombre de usuario es requerido',
                    minLength: {
                      value: 3,
                      message: 'El nombre de usuario debe tener al menos 3 caracteres'
                    }
                  })}
                />
                {errors.username && (
                  <div className="invalid-feedback">
                    {errors.username.message}
                  </div>
                )}
              </div>
            </div>

            <div className="col-md-6">
              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  Contraseña {!guard && <span className="text-danger">*</span>}
                </label>
                <input
                  type="password"
                  id="password"
                  className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                  {...register('password', {
                    required: !guard ? 'La contraseña es requerida' : false,
                    minLength: {
                      value: 8,
                      message: 'La contraseña debe tener al menos 8 caracteres'
                    }
                  })}
                />
                {errors.password && (
                  <div className="invalid-feedback">
                    {errors.password.message}
                  </div>
                )}
                {guard && (
                  <small className="form-text text-muted">
                    Deje en blanco para mantener la contraseña actual
                  </small>
                )}
              </div>
            </div>
          </div>

          <h6 className="form-section-title mt-4">Información Personal</h6>
          <div className="row">
            <div className="col-md-6">
              <div className="form-group">
                <label htmlFor="fullName" className="form-label">
                  Nombre Completo <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  id="fullName"
                  className={`form-control ${errors.fullName ? 'is-invalid' : ''}`}
                  {...register('fullName', {
                    required: 'El nombre completo es requerido',
                    minLength: {
                      value: 2,
                      message: 'El nombre debe tener al menos 2 caracteres'
                    }
                  })}
                />
                {errors.fullName && (
                  <div className="invalid-feedback">
                    {errors.fullName.message}
                  </div>
                )}
              </div>
            </div>

            <div className="col-md-6">
              <div className="form-group">
                <label htmlFor="documentType" className="form-label">
                  Tipo de Documento <span className="text-danger">*</span>
                </label>
                <select
                  id="documentType"
                  className={`form-select ${errors.documentType ? 'is-invalid' : ''}`}
                  {...register('documentType', {
                    required: 'El tipo de documento es requerido'
                  })}
                >
                  <option value="CC">Cédula de Ciudadanía</option>
                  <option value="CE">Cédula de Extranjería</option>
                  <option value="PP">Pasaporte</option>
                  <option value="TI">Tarjeta de Identidad</option>
                </select>
                {errors.documentType && (
                  <div className="invalid-feedback">
                    {errors.documentType.message}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
              <div className="form-group">
                <label htmlFor="documentNumber" className="form-label">
                  Número de Documento <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  id="documentNumber"
                  className={`form-control ${errors.documentNumber ? 'is-invalid' : ''}`}
                  {...register('documentNumber', {
                    required: 'El número de documento es requerido',
                    pattern: {
                      value: /^[0-9]+$/,
                      message: 'El número de documento solo debe contener números'
                    },
                    minLength: {
                      value: 6,
                      message: 'El número de documento debe tener al menos 6 dígitos'
                    }
                  })}
                />
                {errors.documentNumber && (
                  <div className="invalid-feedback">
                    {errors.documentNumber.message}
                  </div>
                )}
              </div>
            </div>

            <div className="col-md-6">
              <div className="form-group">
                <label htmlFor="telephoneNumber" className="form-label">
                  Teléfono
                </label>
                <input
                  type="text"
                  id="telephoneNumber"
                  className={`form-control ${errors.telephoneNumber ? 'is-invalid' : ''}`}
                  {...register('telephoneNumber', {
                    pattern: {
                      value: /^3[0-9]{9}$/,
                      message: 'Debe ser un número de celular válido (10 dígitos, inicia con 3)'
                    }
                  })}
                />
                {errors.telephoneNumber && (
                  <div className="invalid-feedback">
                    {errors.telephoneNumber.message}
                  </div>
                )}
              </div>
            </div>
          </div>

          <h6 className="form-section-title mt-4">Información Laboral</h6>
          <div className="row">
            <div className="col-md-6">
              <div className="form-group">
                <label htmlFor="arl" className="form-label">
                  ARL <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  id="arl"
                  className={`form-control ${errors.arl ? 'is-invalid' : ''}`}
                  {...register('arl', {
                    required: 'La ARL es requerida',
                    minLength: {
                      value: 2,
                      message: 'La ARL debe tener al menos 2 caracteres'
                    }
                  })}
                />
                {errors.arl && (
                  <div className="invalid-feedback">
                    {errors.arl.message}
                  </div>
                )}
              </div>
            </div>

            <div className="col-md-6">
              <div className="form-group">
                <label htmlFor="eps" className="form-label">
                  EPS <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  id="eps"
                  className={`form-control ${errors.eps ? 'is-invalid' : ''}`}
                  {...register('eps', {
                    required: 'La EPS es requerida',
                    minLength: {
                      value: 2,
                      message: 'La EPS debe tener al menos 2 caracteres'
                    }
                  })}
                />
                {errors.eps && (
                  <div className="invalid-feedback">
                    {errors.eps.message}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
              <div className="form-group">
                <label htmlFor="shift" className="form-label">
                  Turno <span className="text-danger">*</span>
                </label>
                <select
                  id="shift"
                  className={`form-select ${errors.shift ? 'is-invalid' : ''}`}
                  {...register('shift', {
                    required: 'El turno es requerido'
                  })}
                >
                  <option value="Morning">Mañana</option>
                  <option value="Afternoon">Tarde</option>
                  <option value="Evening">Noche</option>
                  <option value="Night">Madrugada</option>
                </select>
                {errors.shift && (
                  <div className="invalid-feedback">
                    {errors.shift.message}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                {guard ? 'Actualizando...' : 'Creando...'}
              </>
            ) : (
              guard ? 'Actualizar' : 'Crear'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default GuardModal; 