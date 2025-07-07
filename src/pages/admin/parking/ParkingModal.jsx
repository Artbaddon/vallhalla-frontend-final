import React, { useState, useEffect } from "react";
import { useQuery } from "react-query";
import { ownersAPI } from "../../../services/api";

const ParkingModal = ({ show, onHide, onSubmit, parkingSpace, isLoading }) => {
  const [formData, setFormData] = useState({
    number: "",
    type: "car",
    status: "available",
    location: "",
    description: "",
    owner_id: ""
  });

  // Fetch owners for dropdown
  const { data: ownersResponse } = useQuery("owners", ownersAPI.getAll, {
    enabled: show,
    onError: (err) => {
      console.error("Error fetching owners:", err);
    }
  });

  const owners = ownersResponse?.data || [];

  // Reset form when modal opens/closes or when editing a different parking space
  useEffect(() => {
    if (show) {
      if (parkingSpace) {
        // Editing existing parking space
        setFormData({
          number: parkingSpace.number || "",
          type: parkingSpace.type || "car",
          status: parkingSpace.status || "available",
          location: parkingSpace.location || "",
          description: parkingSpace.description || "",
          owner_id: parkingSpace.owner_id?.toString() || ""
        });
      } else {
        // Creating new parking space
        setFormData({
          number: "",
          type: "car",
          status: "available",
          location: "",
          description: "",
          owner_id: ""
        });
      }
    }
  }, [show, parkingSpace]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Convert string IDs to numbers
    const submissionData = {
      ...formData,
      owner_id: formData.owner_id ? parseInt(formData.owner_id) : null
    };

    onSubmit(
      parkingSpace
        ? { id: parkingSpace.id, data: submissionData }
        : submissionData
    );
  };

  if (!show) return null;

  return (
    <div className="modal-backdrop" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1050
    }}>
      <div className="modal-content" style={{
        backgroundColor: 'white',
        borderRadius: '5px',
        width: '90%',
        maxWidth: '600px',
        maxHeight: '90vh',
        overflow: 'auto',
        position: 'relative'
      }}>
        <div className="modal-header" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1rem',
          borderBottom: '1px solid #dee2e6'
        }}>
          <h5 className="modal-title">
            {parkingSpace ? "Editar Espacio de Parqueo" : "Crear Espacio de Parqueo"}
          </h5>
          <button 
            type="button" 
            className="btn-close" 
            onClick={onHide}
            aria-label="Close"
            style={{
              background: 'transparent',
              border: 0,
              fontSize: '1.5rem',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ padding: '1rem' }}>
            <div className="row">
              <div className="col-md-6">
                <div className="mb-3">
                  <label htmlFor="number" className="form-label">
                    Número <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="number"
                    name="number"
                    value={formData.number}
                    onChange={handleChange}
                    placeholder="Ej: A-101"
                    required
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label htmlFor="type" className="form-label">
                    Tipo <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-select"
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    required
                  >
                    <option value="car">Automóvil</option>
                    <option value="motorcycle">Motocicleta</option>
                    <option value="bicycle">Bicicleta</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <div className="mb-3">
                  <label htmlFor="status" className="form-label">
                    Estado <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-select"
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    required
                  >
                    <option value="available">Disponible</option>
                    <option value="occupied">Ocupado</option>
                    <option value="reserved">Reservado</option>
                    <option value="maintenance">En Mantenimiento</option>
                  </select>
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label htmlFor="location" className="form-label">
                    Ubicación <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Ej: Sótano 1, Torre Norte"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="description" className="form-label">
                Descripción
              </label>
              <textarea
                className="form-control"
                id="description"
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                placeholder="Información adicional sobre el espacio"
              />
            </div>

            <div className="mb-3">
              <label htmlFor="owner_id" className="form-label">
                Propietario Asignado
              </label>
              <select
                className="form-select"
                id="owner_id"
                name="owner_id"
                value={formData.owner_id}
                onChange={handleChange}
              >
                <option value="">Sin asignar</option>
                {owners.map((owner) => (
                  <option key={owner.id} value={owner.id.toString()}>
                    {owner.first_name} {owner.last_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="modal-footer" style={{
            display: 'flex',
            justifyContent: 'flex-end',
            padding: '1rem',
            borderTop: '1px solid #dee2e6'
          }}>
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={onHide} 
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
                  {parkingSpace ? "Actualizando..." : "Creando..."}
                </>
              ) : (
                parkingSpace ? "Actualizar" : "Crear"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ParkingModal; 