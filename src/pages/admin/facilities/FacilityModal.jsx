import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Modal from 'react-modal';

// Make sure to bind modal to your app element
Modal.setAppElement('#root');

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    maxWidth: '500px',
    width: '90%',
    padding: '20px',
    borderRadius: '8px',
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
  },
};

const FacilityModal = ({ isOpen, onClose, onSubmit, facility }) => {
  const isEditing = !!facility;
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: {
      name: facility?.name || '',
      description: facility?.description || '',
      capacity: facility?.capacity || '',
      status: facility?.status || 'available',
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        name: facility?.name || '',
        description: facility?.description || '',
        capacity: facility?.capacity || '',
        status: facility?.status || 'available',
      });
    }
  }, [isOpen, facility, reset]);

  const submitForm = (data) => {
    // Convert capacity to number if provided
    if (data.capacity) {
      data.capacity = parseInt(data.capacity, 10);
    }
    onSubmit(data);
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={customStyles}
      contentLabel="Facility Modal"
    >
      <div className="modal-header">
        <h2>{isEditing ? 'Editar Instalación' : 'Crear Nueva Instalación'}</h2>
        <button type="button" className="btn-close" onClick={onClose}></button>
      </div>
      
      <form onSubmit={handleSubmit(submitForm)}>
        <div className="modal-body">
          <div className="mb-3">
            <label htmlFor="name" className="form-label">Nombre</label>
            <input
              type="text"
              className={`form-control ${errors.name ? 'is-invalid' : ''}`}
              id="name"
              {...register('name', { required: 'Este campo es requerido' })}
            />
            {errors.name && (
              <div className="invalid-feedback">
                {errors.name.message}
              </div>
            )}
          </div>
          
          <div className="mb-3">
            <label htmlFor="description" className="form-label">Descripción</label>
            <textarea
              className={`form-control ${errors.description ? 'is-invalid' : ''}`}
              id="description"
              rows="3"
              {...register('description', { required: 'Este campo es requerido' })}
            ></textarea>
            {errors.description && (
              <div className="invalid-feedback">
                {errors.description.message}
              </div>
            )}
          </div>
          
          <div className="mb-3">
            <label htmlFor="capacity" className="form-label">Capacidad</label>
            <input
              type="number"
              className={`form-control ${errors.capacity ? 'is-invalid' : ''}`}
              id="capacity"
              min="1"
              {...register('capacity', { 
                min: { value: 1, message: 'La capacidad debe ser al menos 1' },
                valueAsNumber: true,
              })}
            />
            {errors.capacity && (
              <div className="invalid-feedback">
                {errors.capacity.message}
              </div>
            )}
          </div>
          
          <div className="mb-3">
            <label htmlFor="status" className="form-label">Estado</label>
            <select
              className={`form-select ${errors.status ? 'is-invalid' : ''}`}
              id="status"
              {...register('status', { required: 'Este campo es requerido' })}
            >
              <option value="available">Disponible</option>
              <option value="maintenance">En mantenimiento</option>
              <option value="reserved">Reservado</option>
              <option value="unavailable">No disponible</option>
            </select>
            {errors.status && (
              <div className="invalid-feedback">
                {errors.status.message}
              </div>
            )}
          </div>
        </div>
        
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary">
            {isEditing ? 'Actualizar' : 'Crear'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default FacilityModal; 