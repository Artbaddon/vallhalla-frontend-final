import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Modal from 'react-modal';
import './OwnerModal.css';

// Set modal app element for accessibility
Modal.setAppElement('#root');

const OwnerModal = ({ show, onHide, onSubmit, owner, isLoading }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isTenant, setIsTenant] = useState(false);
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue
  } = useForm();

  useEffect(() => {
    setIsOpen(show);
    if (show && owner) {
      // Populate form for editing
      setValue('username', owner.username || '');
      setValue('password', ''); // Don't populate password for security
      setValue('user_status_id', owner.user_status_id || 1);
      setValue('role_id', owner.role_id || 3);
      setValue('is_tenant', owner.Owner_is_tenant === 1);
      setIsTenant(owner.Owner_is_tenant === 1);
      setValue('birth_date', owner.Owner_birth_date ? owner.Owner_birth_date.split('T')[0] : '');
      setValue('first_name', owner.first_name || owner.Owner_first_name || '');
      setValue('last_name', owner.last_name || owner.Owner_last_name || '');
      setValue('document_type', owner.document_type || owner.Owner_document_type || 'CC');
      setValue('document_number', owner.document_number || owner.Owner_document_number || '');
      setValue('phone', owner.phone || owner.Owner_phone || '');
      setValue('email', owner.email || owner.Owner_email || '');
      setValue('tower', owner.tower || '');
      setValue('apartment', owner.apartment || '');
    } else if (show) {
      // Reset form for creating
      reset();
      setIsTenant(false);
      setValue('user_status_id', 1);
      setValue('role_id', 3);
      setValue('is_tenant', false);
      setValue('document_type', 'CC');
    }
  }, [show, owner, setValue, reset]);

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
      user_status_id: parseInt(data.user_status_id) || 1,
      role_id: parseInt(data.role_id) || 3,
      is_tenant: data.is_tenant ? 1 : 0,
      birth_date: data.birth_date,
      first_name: data.first_name,
      last_name: data.last_name,
      document_type: data.document_type,
      document_number: data.document_number,
      email: data.email,
      phone: data.phone,
      photo_url: null
    };
    
    onSubmit(formattedData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleClose}
      className="owner-modal"
      overlayClassName="modal-overlay"
      contentLabel={owner ? "Editar Propietario" : "Nuevo Propietario"}
    >
      <div className="modal-header">
        <h5 className="modal-title">
          {owner ? 'Editar Propietario' : 'Nuevo Propietario'}
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
                  Contraseña {!owner && <span className="text-danger">*</span>}
                </label>
                <input
                  type="password"
                  id="password"
                  className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                  {...register('password', {
                    required: !owner ? 'La contraseña es requerida' : false,
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
                {owner && (
                  <small className="form-text text-muted">
                    Deje en blanco para mantener la contraseña actual
                  </small>
                )}
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
              <div className="form-group">
                <label htmlFor="user_status_id" className="form-label">
                  Estado de Usuario
                </label>
                <select
                  id="user_status_id"
                  className="form-select"
                  {...register('user_status_id')}
                >
                  <option value="1">Activo</option>
                  <option value="2">Inactivo</option>
                  <option value="3">Pendiente</option>
                </select>
              </div>
            </div>

            <div className="col-md-6">
              <div className="form-group">
                <label htmlFor="is_tenant" className="form-label d-block">
                  ¿Es inquilino?
                </label>
                <div className="form-check form-switch">
                  <input
                    type="checkbox"
                    id="is_tenant"
                    className="form-check-input"
                    {...register('is_tenant')}
                    onChange={(e) => setIsTenant(e.target.checked)}
                    checked={isTenant}
                  />
                  <label className="form-check-label" htmlFor="is_tenant">
                    {isTenant ? 'Sí' : 'No'}
                  </label>
                </div>
              </div>
            </div>
          </div>

          <h6 className="form-section-title mt-4">Información Personal</h6>
          <div className="row">
            <div className="col-md-6">
              <div className="form-group">
                <label htmlFor="first_name" className="form-label">
                  Nombre <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  id="first_name"
                  className={`form-control ${errors.first_name ? 'is-invalid' : ''}`}
                  {...register('first_name', {
                    required: 'El nombre es requerido',
                    minLength: {
                      value: 2,
                      message: 'El nombre debe tener al menos 2 caracteres'
                    }
                  })}
                />
                {errors.first_name && (
                  <div className="invalid-feedback">
                    {errors.first_name.message}
                  </div>
                )}
              </div>
            </div>

            <div className="col-md-6">
              <div className="form-group">
                <label htmlFor="last_name" className="form-label">
                  Apellido <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  id="last_name"
                  className={`form-control ${errors.last_name ? 'is-invalid' : ''}`}
                  {...register('last_name', {
                    required: 'El apellido es requerido',
                    minLength: {
                      value: 2,
                      message: 'El apellido debe tener al menos 2 caracteres'
                    }
                  })}
                />
                {errors.last_name && (
                  <div className="invalid-feedback">
                    {errors.last_name.message}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email <span className="text-danger">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                  {...register('email', {
                    required: 'El email es requerido',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Email inválido'
                    }
                  })}
                />
                {errors.email && (
                  <div className="invalid-feedback">
                    {errors.email.message}
                  </div>
                )}
              </div>
            </div>

            <div className="col-md-6">
              <div className="form-group">
                <label htmlFor="phone" className="form-label">
                  Teléfono <span className="text-danger">*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                  {...register('phone', {
                    required: 'El teléfono es requerido'
                  })}
                />
                {errors.phone && (
                  <div className="invalid-feedback">
                    {errors.phone.message}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-4">
              <div className="form-group">
                <label htmlFor="document_type" className="form-label">
                  Tipo de Documento <span className="text-danger">*</span>
                </label>
                <select
                  id="document_type"
                  className={`form-select ${errors.document_type ? 'is-invalid' : ''}`}
                  {...register('document_type', {
                    required: 'El tipo de documento es requerido'
                  })}
                >
                  <option value="">Seleccionar...</option>
                  <option value="CC">Cédula de Ciudadanía</option>
                  <option value="CE">Cédula de Extranjería</option>
                  <option value="TI">Tarjeta de Identidad</option>
                  <option value="PP">Pasaporte</option>
                </select>
                {errors.document_type && (
                  <div className="invalid-feedback">
                    {errors.document_type.message}
                  </div>
                )}
              </div>
            </div>

            <div className="col-md-8">
              <div className="form-group">
                <label htmlFor="document_number" className="form-label">
                  Número de Documento <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  id="document_number"
                  className={`form-control ${errors.document_number ? 'is-invalid' : ''}`}
                  {...register('document_number', {
                    required: 'El número de documento es requerido'
                  })}
                />
                {errors.document_number && (
                  <div className="invalid-feedback">
                    {errors.document_number.message}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-4">
              <div className="form-group">
                <label htmlFor="birth_date" className="form-label">
                  Fecha de Nacimiento <span className="text-danger">*</span>
                </label>
                <input
                  type="date"
                  id="birth_date"
                  className={`form-control ${errors.birth_date ? 'is-invalid' : ''}`}
                  {...register('birth_date', {
                    required: 'La fecha de nacimiento es requerida'
                  })}
                />
                {errors.birth_date && (
                  <div className="invalid-feedback">
                    {errors.birth_date.message}
                  </div>
                )}
              </div>
            </div>

            <div className="col-md-4">
              <div className="form-group">
                <label htmlFor="tower" className="form-label">
                  Torre
                </label>
                <input
                  type="text"
                  id="tower"
                  className="form-control"
                  {...register('tower')}
                />
              </div>
            </div>

            <div className="col-md-4">
              <div className="form-group">
                <label htmlFor="apartment" className="form-label">
                  Apartamento
                </label>
                <input
                  type="text"
                  id="apartment"
                  className="form-control"
                  {...register('apartment')}
                />
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
                Guardando...
              </>
            ) : (
              owner ? 'Actualizar' : 'Guardar'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default OwnerModal; 