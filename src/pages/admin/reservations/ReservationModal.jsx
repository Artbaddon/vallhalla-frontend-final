import React, { useState, useEffect } from 'react';
import { reservationsAPI } from '../../../services/apiService';

const ReservationModal = ({ 
  show, 
  mode, 
  reservation, 
  facilities, 
  reservationTypes, 
  reservationStatus, 
  owners, 
  onClose, 
  onSave 
}) => {
  const [formData, setFormData] = useState({
    owner_id: '',
    type_id: '',
    facility_id: '',
    start_date: '',
    end_date: '',
    description: '',
    status_id: 1 // Default to pending
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (show) {
      if (mode === 'edit' && reservation) {
        // Format dates for datetime-local input
        const startDate = reservation.Reservation_start_time ? 
          new Date(reservation.Reservation_start_time).toISOString().slice(0, 16) : '';
        const endDate = reservation.Reservation_end_time ? 
          new Date(reservation.Reservation_end_time).toISOString().slice(0, 16) : '';

        setFormData({
          owner_id: reservation.Owner_FK_ID || '',
          type_id: reservation.Reservation_type_FK_ID || '',
          facility_id: reservation.Facility_FK_ID || '',
          start_date: startDate,
          end_date: endDate,
          description: reservation.Reservation_description || '',
          status_id: reservation.Reservation_status_FK_ID || 1
        });
      } else if (mode === 'create') {
        // Reset form for create mode
        setFormData({
          owner_id: '',
          type_id: '',
          facility_id: '',
          start_date: '',
          end_date: '',
          description: '',
          status_id: 1
        });
      }
      setErrors({});
    }
  }, [show, mode, reservation]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && show) {
        onClose();
      }
    };

    if (show) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [show, onClose]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.owner_id) {
      newErrors.owner_id = 'Propietario es requerido';
    }
    if (!formData.type_id) {
      newErrors.type_id = 'Tipo de reserva es requerido';
    }
    if (!formData.facility_id) {
      newErrors.facility_id = 'Instalación es requerida';
    }
    if (!formData.start_date) {
      newErrors.start_date = 'Fecha de inicio es requerida';
    }
    if (!formData.end_date) {
      newErrors.end_date = 'Fecha de fin es requerida';
    }

    // Validate date range
    if (formData.start_date && formData.end_date) {
      const startDate = new Date(formData.start_date);
      const endDate = new Date(formData.end_date);
      const now = new Date();

      if (startDate < now && mode === 'create') {
        newErrors.start_date = 'La fecha de inicio no puede ser en el pasado';
      }
      if (endDate <= startDate) {
        newErrors.end_date = 'La fecha de fin debe ser posterior a la fecha de inicio';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const submitData = {
        type_id: parseInt(formData.type_id),
        facility_id: parseInt(formData.facility_id),
        start_date: new Date(formData.start_date).toISOString(),
        end_date: new Date(formData.end_date).toISOString(),
        description: formData.description || null
      };

      // Only include owner_id for create mode, not edit mode
      if (mode === 'create') {
        submitData.owner_id = parseInt(formData.owner_id);
      }

      // Only include status_id for edit mode, not create mode
      if (mode === 'edit' && formData.status_id) {
        submitData.status_id = parseInt(formData.status_id);
      }

      console.log('Available owners:', owners);
      console.log('Selected owner_id from form:', formData.owner_id);
      console.log('Parsed owner_id:', parseInt(formData.owner_id));
      console.log('Owner exists in list:', owners.find(o => o.Owner_id === parseInt(formData.owner_id)));
      console.log('Submitting reservation data:', submitData);

      if (mode === 'create') {
        await reservationsAPI.create(submitData);
      } else if (mode === 'edit') {
        await reservationsAPI.update(reservation.Reservation_id, submitData);
      }

      onSave();
    } catch (error) {
      console.error('Error saving reservation:', error);
      
      // Handle specific error messages
      if (error.response?.data?.error) {
        if (error.response.data.error.includes('already reserved')) {
          setErrors({ facility_id: 'Esta instalación ya está reservada para el período seleccionado' });
        } else {
          setErrors({ general: error.response.data.error });
        }
      } else {
        setErrors({ general: 'Error al guardar la reserva: ' + error.message });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return 'N/A';
    const date = new Date(dateTime);
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (statusId, statusName) => {
    const statusClasses = {
      1: 'bg-warning text-dark', // Pending
      2: 'bg-success', // Confirmed
      3: 'bg-info', // In Progress
      4: 'bg-danger', // Cancelled
      5: 'bg-secondary' // No Show
    };

    const className = statusClasses[statusId] || 'bg-secondary';
    return <span className={`badge ${className}`}>{statusName || 'N/A'}</span>;
  };

  const getOwnerName = (ownerId) => {
    const owner = owners.find(o => o.Owner_id === ownerId);
    return owner ? owner.Profile_fullName || 'Sin nombre' : 'N/A';
  };

  const getTypeName = (typeId) => {
    const type = reservationTypes.find(t => t.Reservation_type_id === typeId);
    return type ? type.Reservation_type_name : 'N/A';
  };

  const getFacilityName = (facilityId) => {
    const facility = facilities.find(f => f.Facility_id === facilityId);
    return facility ? facility.Facility_name : 'N/A';
  };

  const getStatusName = (statusId) => {
    const status = reservationStatus.find(s => s.Reservation_status_id === statusId);
    return status ? status.Reservation_status_name : 'N/A';
  };

  if (!show) return null;

  const isViewMode = mode === 'view';
  const isEditMode = mode === 'edit';
  const modalTitle = isViewMode ? 'Ver Reserva' : isEditMode ? 'Editar Reserva' : 'Nueva Reserva';

  return (
    <div className="modal-overlay" onClick={handleBackdropClick}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{modalTitle}</h5>
            <button 
              type="button" 
              className="btn-close" 
              onClick={onClose}
              disabled={loading}
            ></button>
          </div>

          <div className="modal-body">
            {errors.general && (
              <div className="alert alert-danger" role="alert">
                {errors.general}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {isViewMode ? (
                // View Mode - Read Only
                <div className="row g-4">
                  <div className="col-md-6">
                    <div className="card h-100">
                      <div className="card-header">
                        <h6 className="card-title mb-0">Información General</h6>
                      </div>
                      <div className="card-body">
                        <div className="mb-3">
                          <label className="form-label fw-bold">Propietario:</label>
                          <p className="mb-0">{getOwnerName(reservation?.Owner_FK_ID)}</p>
                        </div>
                        <div className="mb-3">
                          <label className="form-label fw-bold">Tipo de Reserva:</label>
                          <p className="mb-0">{getTypeName(reservation?.Reservation_type_FK_ID)}</p>
                        </div>
                        <div className="mb-3">
                          <label className="form-label fw-bold">Instalación:</label>
                          <p className="mb-0">{getFacilityName(reservation?.Facility_FK_ID)}</p>
                        </div>
                        <div className="mb-3">
                          <label className="form-label fw-bold">Estado:</label>
                          <div>
                            {getStatusBadge(reservation?.Reservation_status_FK_ID, getStatusName(reservation?.Reservation_status_FK_ID))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="card h-100">
                      <div className="card-header">
                        <h6 className="card-title mb-0">Fechas y Horarios</h6>
                      </div>
                      <div className="card-body">
                        <div className="mb-3">
                          <label className="form-label fw-bold">Fecha y Hora de Inicio:</label>
                          <p className="mb-0">{formatDateTime(reservation?.Reservation_start_time)}</p>
                        </div>
                        <div className="mb-3">
                          <label className="form-label fw-bold">Fecha y Hora de Fin:</label>
                          <p className="mb-0">{formatDateTime(reservation?.Reservation_end_time)}</p>
                        </div>
                        <div className="mb-3">
                          <label className="form-label fw-bold">Descripción:</label>
                          <p className="mb-0">{reservation?.Reservation_description || 'Sin descripción'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // Create/Edit Mode - Form
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Propietario *</label>
                    <select
                      className={`form-select ${errors.owner_id ? 'is-invalid' : ''}`}
                      name="owner_id"
                      value={formData.owner_id}
                      onChange={handleInputChange}
                      disabled={loading || isEditMode}
                    >
                      <option value="">Seleccione un propietario</option>
                      {owners.map(owner => (
                        <option key={`owner-${owner.Owner_id}`} value={owner.Owner_id}>
                          {owner.Profile_fullName || 'Sin nombre'} - Apt {owner.Apartment_number || 'N/A'}
                        </option>
                      ))}
                    </select>
                    {errors.owner_id && (
                      <div className="invalid-feedback">{errors.owner_id}</div>
                    )}
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Tipo de Reserva *</label>
                    <select
                      className={`form-select ${errors.type_id ? 'is-invalid' : ''}`}
                      name="type_id"
                      value={formData.type_id}
                      onChange={handleInputChange}
                      disabled={loading}
                    >
                      <option value="">Seleccione un tipo</option>
                      {reservationTypes.map(type => (
                        <option key={`type-${type.Reservation_type_id}`} value={type.Reservation_type_id}>
                          {type.Reservation_type_name}
                        </option>
                      ))}
                    </select>
                    {errors.type_id && (
                      <div className="invalid-feedback">{errors.type_id}</div>
                    )}
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Instalación *</label>
                    <select
                      className={`form-select ${errors.facility_id ? 'is-invalid' : ''}`}
                      name="facility_id"
                      value={formData.facility_id}
                      onChange={handleInputChange}
                      disabled={loading}
                    >
                      <option value="">Seleccione una instalación</option>
                      {facilities.map(facility => (
                        <option key={`facility-${facility.Facility_id}`} value={facility.Facility_id}>
                          {facility.Facility_name}
                        </option>
                      ))}
                    </select>
                    {errors.facility_id && (
                      <div className="invalid-feedback">{errors.facility_id}</div>
                    )}
                  </div>

                  {isEditMode && (
                    <div className="col-md-6">
                      <label className="form-label">Estado</label>
                      <select
                        className="form-select"
                        name="status_id"
                        value={formData.status_id}
                        onChange={handleInputChange}
                        disabled={loading}
                      >
                        {reservationStatus.map(status => (
                          <option key={`status-${status.Reservation_status_id}`} value={status.Reservation_status_id}>
                            {status.Reservation_status_name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="col-md-6">
                    <label className="form-label">Fecha y Hora de Inicio *</label>
                    <input
                      type="datetime-local"
                      className={`form-control ${errors.start_date ? 'is-invalid' : ''}`}
                      name="start_date"
                      value={formData.start_date}
                      onChange={handleInputChange}
                      disabled={loading}
                    />
                    {errors.start_date && (
                      <div className="invalid-feedback">{errors.start_date}</div>
                    )}
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Fecha y Hora de Fin *</label>
                    <input
                      type="datetime-local"
                      className={`form-control ${errors.end_date ? 'is-invalid' : ''}`}
                      name="end_date"
                      value={formData.end_date}
                      onChange={handleInputChange}
                      disabled={loading}
                    />
                    {errors.end_date && (
                      <div className="invalid-feedback">{errors.end_date}</div>
                    )}
                  </div>

                  <div className="col-12">
                    <label className="form-label">Descripción</label>
                    <textarea
                      className="form-control"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="3"
                      placeholder="Descripción opcional de la reserva"
                      disabled={loading}
                    ></textarea>
                  </div>
                </div>
              )}
            </form>
          </div>

          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={onClose}
              disabled={loading}
            >
              {isViewMode ? 'Cerrar' : 'Cancelar'}
            </button>
            {!isViewMode && (
              <button 
                type="submit" 
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Guardando...
                  </>
                ) : (
                  isEditMode ? 'Actualizar' : 'Crear Reserva'
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReservationModal; 