import React, { useState, useEffect } from "react";
import { useQuery } from "react-query";
import { vehicleTypesAPI } from "../../../services/api";

const VehicleAssignmentModal = ({ show, onHide, onSubmit, parking, isLoading }) => {
  const [selectedVehicleId, setSelectedVehicleId] = useState("");

  // Fetch available vehicles
  const { data: vehiclesResponse, isLoading: vehiclesLoading } = useQuery(
    "available-vehicles",
    vehicleTypesAPI.getAll,
    {
      enabled: show,
      onError: (err) => {
        console.error("Error fetching available vehicles:", err);
      }
    }
  );

  const vehicles = vehiclesResponse?.data || [];

  // Reset form when modal opens/closes
  useEffect(() => {
    if (show && vehicles.length > 0) {
      setSelectedVehicleId(vehicles[0].id.toString());
    } else {
      setSelectedVehicleId("");
    }
  }, [show, vehicles]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!selectedVehicleId) return;
    
    onSubmit({
      parkingId: parking.id,
      vehicleTypeId: parseInt(selectedVehicleId)
    });
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
        maxWidth: '500px',
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
            Asignar Vehículo al Espacio {parking?.number}
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
            {vehiclesLoading ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Cargando...</span>
                </div>
                <p className="mt-2">Cargando vehículos disponibles...</p>
              </div>
            ) : vehicles.length === 0 ? (
              <div className="alert alert-info">
                No hay vehículos disponibles para asignar.
              </div>
            ) : (
              <div className="mb-3">
                <label htmlFor="vehicleId" className="form-label">
                  Seleccionar Vehículo
                </label>
                <select
                  className="form-select"
                  id="vehicleId"
                  value={selectedVehicleId}
                  onChange={(e) => setSelectedVehicleId(e.target.value)}
                  required
                >
                  <option value="">Seleccione un vehículo</option>
                  {vehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id.toString()}>
                      {vehicle.vehicle_brand || 'Marca'} {vehicle.vehicle_model || 'Modelo'} - {vehicle.vehicle_plate || 'Placa'}
                    </option>
                  ))}
                </select>
              </div>
            )}
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
              disabled={isLoading || vehiclesLoading || vehicles.length === 0}
            >
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Asignando...
                </>
              ) : (
                "Asignar"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VehicleAssignmentModal; 