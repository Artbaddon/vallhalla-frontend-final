import React, { useState, useEffect } from 'react';
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

const TowerModal = ({ isOpen, onClose, onSubmit, tower }) => {
  const isEditing = !!tower;
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: {
      Tower_name: tower?.Tower_name || '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        Tower_name: tower?.Tower_name || '',
      });
    }
  }, [isOpen, tower, reset]);

  const submitForm = (data) => {
    onSubmit(data);
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={customStyles}
      contentLabel="Tower Modal"
    >
      <div className="modal-header">
        <h2>{isEditing ? 'Editar Torre' : 'Crear Nueva Torre'}</h2>
        <button type="button" className="btn-close" onClick={onClose}></button>
      </div>
      
      <form onSubmit={handleSubmit(submitForm)}>
        <div className="modal-body">
          <div className="mb-3">
            <label htmlFor="Tower_name" className="form-label">Nombre de la Torre</label>
            <input
              type="text"
              className={`form-control ${errors.Tower_name ? 'is-invalid' : ''}`}
              id="Tower_name"
              {...register('Tower_name', { required: 'Este campo es requerido' })}
            />
            {errors.Tower_name && (
              <div className="invalid-feedback">
                {errors.Tower_name.message}
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

export default TowerModal; 