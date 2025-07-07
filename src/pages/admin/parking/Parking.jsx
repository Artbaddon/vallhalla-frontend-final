import React, { useState, useEffect } from 'react';
import { parkingAPI, vehicleTypesAPI, ownersAPI } from '../../../services/api';
import ParkingModal from './ParkingModal';
import './Parking.css';

// Assignment Modal Component
const AssignModal = ({ show, parking, owners, onClose, onSubmit }) => {
  const [selectedOwnerId, setSelectedOwnerId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOwnerId) {
      alert('Por favor seleccione un propietario');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(selectedOwnerId);
    } catch (error) {
      console.error('Error in assignment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setSelectedOwnerId('');
      onClose();
    }
  };

  if (!show) return null;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && handleClose()}>
      <div className="modal-container" style={{ maxWidth: '500px' }}>
        <div className="modal-header">
          <h2>Asignar Propietario</h2>
          <button type="button" className="btn-close" onClick={handleClose} disabled={loading}>
            <i className="bi bi-x"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">
                Parqueadero: <strong>#{parking?.Parking_number}</strong>
              </label>
            </div>

            <div className="form-group">
              <label htmlFor="owner-select" className="form-label">
                Seleccionar Propietario <span className="required">*</span>
              </label>
              <select
                id="owner-select"
                className="form-select"
                value={selectedOwnerId}
                onChange={(e) => setSelectedOwnerId(e.target.value)}
                disabled={loading}
                required
              >
                <option value="">Seleccionar propietario...</option>
                {owners.map(owner => (
                  <option key={owner.Owner_id} value={owner.Owner_id}>
                    {owner.Users_name} - {owner.Users_email}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !selectedOwnerId}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Asignando...
                </>
              ) : (
                <>
                  <i className="bi bi-person-plus me-2"></i>
                  Asignar
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Parking = () => {
  const [parkingSpots, setParkingSpots] = useState([]);
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingParking, setEditingParking] = useState(null);
  const [modalMode, setModalMode] = useState('create');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [owners, setOwners] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assigningParking, setAssigningParking] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [parkingResponse, vehicleTypesResponse, ownersResponse] = await Promise.all([
        parkingAPI.getAll(),
        vehicleTypesAPI.getAll(),
        ownersAPI.getDetails()
      ]);

      console.log('Parking data received:', parkingResponse);
      console.log('Vehicle types received:', vehicleTypesResponse);
      console.log('Owners received:', ownersResponse);

      setParkingSpots(parkingResponse.data || []);
      setVehicleTypes(vehicleTypesResponse.data || []);
      setOwners(ownersResponse || []);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingParking(null);
    setModalMode('create');
    setShowModal(true);
  };

  const handleEdit = (parking) => {
    setEditingParking(parking);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleView = (parking) => {
    setEditingParking(parking);
    setModalMode('view');
    setShowModal(true);
  };

  const handleDelete = async (parking) => {
    if (window.confirm('¿Está seguro de que desea eliminar este parqueadero?')) {
      try {
        await parkingAPI.delete(parking.Parking_id);
        loadData();
      } catch (err) {
        console.error('Error deleting parking:', err);
        alert('Error al eliminar el parqueadero');
      }
    }
  };

  const handleModalSubmit = async (data) => {
    try {
      if (modalMode === 'create') {
        await parkingAPI.create(data);
      } else if (modalMode === 'edit') {
        await parkingAPI.update(editingParking.Parking_id, data);
      }
      setShowModal(false);
      loadData();
    } catch (err) {
      console.error('Error saving parking:', err);
      
      // Handle specific error cases
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message;
      
      if (errorMessage.includes('Duplicate entry') && errorMessage.includes('Parking_number')) {
        throw new Error('Ya existe un parqueadero con ese número. Por favor, use un número diferente.');
      } else if (errorMessage.includes('Duplicate entry')) {
        throw new Error('Ya existe un registro con esos datos. Por favor, verifique la información.');
      } else {
        throw new Error(`Error al guardar el parqueadero: ${errorMessage}`);
      }
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingParking(null);
  };

  const handleStatusToggle = async (parking) => {
    try {
      // Toggle between Available and Occupied (English names from database)
      const newStatusId = parking.Parking_status_name === 'Available' ? 2 : 1; // 1 = Available, 2 = Occupied
      
      const updateData = {
        number: parking.Parking_number,
        type_id: parking.Parking_type_ID_FK,
        status_id: newStatusId,
        vehicle_type_id: parking.Vehicle_type_ID_FK || null
      };

      await parkingAPI.update(parking.Parking_id, updateData);
      loadData(); // Refresh the data
    } catch (error) {
      console.error('Error toggling parking status:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message;
      alert(`Error al cambiar el estado: ${errorMessage}`);
    }
  };

  const handleAssign = (parking) => {
    setAssigningParking(parking);
    setShowAssignModal(true);
  };

  const handleAssignSubmit = async (ownerId) => {
    try {
      // Find the owner to get their User_FK_ID
      const selectedOwner = owners.find(owner => owner.Owner_id === parseInt(ownerId));
      if (!selectedOwner) {
        alert('Propietario no encontrado');
        return;
      }

      const updateData = {
        number: assigningParking.Parking_number,
        type_id: assigningParking.Parking_type_ID_FK,
        status_id: assigningParking.Parking_status_ID_FK,
        vehicle_type_id: assigningParking.Vehicle_type_ID_FK || null,
        user_id: selectedOwner.User_FK_ID // Assign the user ID
      };

      await parkingAPI.update(assigningParking.Parking_id, updateData);
      setShowAssignModal(false);
      setAssigningParking(null);
      loadData(); // Refresh the data
    } catch (error) {
      console.error('Error assigning parking:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message;
      alert(`Error al asignar el parqueadero: ${errorMessage}`);
    }
  };

  const handleUnassign = async (parking) => {
    if (window.confirm('¿Está seguro de que desea desasignar este parqueadero?')) {
      try {
        const updateData = {
          number: parking.Parking_number,
          type_id: parking.Parking_type_ID_FK,
          status_id: parking.Parking_status_ID_FK,
          vehicle_type_id: parking.Vehicle_type_ID_FK || null,
          user_id: null // Remove assignment
        };

        await parkingAPI.update(parking.Parking_id, updateData);
        loadData(); // Refresh the data
      } catch (error) {
        console.error('Error unassigning parking:', error);
        const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message;
        alert(`Error al desasignar el parqueadero: ${errorMessage}`);
      }
    }
  };

  const getStatusBadge = (statusName) => {
    const statusConfig = {
      'Available': { class: 'success', icon: 'check-circle', label: 'Disponible' },
      'Occupied': { class: 'danger', icon: 'x-circle', label: 'Ocupado' },
      'Reserved': { class: 'warning', icon: 'clock', label: 'Reservado' },
      'Maintenance': { class: 'secondary', icon: 'tools', label: 'Mantenimiento' },
      'Visitor': { class: 'info', icon: 'person', label: 'Visitante' }
    };
    
    const config = statusConfig[statusName] || { class: 'secondary', icon: 'question-circle', label: statusName };
    
    return (
      <span className={`badge bg-${config.class}`}>
        <i className={`bi bi-${config.icon} me-1`}></i>
        {config.label}
      </span>
    );
  };

  const getTypeBadge = (typeName) => {
    const typeConfig = {
      'Resident': { class: 'primary', icon: 'house', label: 'Residente' },
      'Visitor': { class: 'info', icon: 'person', label: 'Visitante' },
      'Handicapped': { class: 'success', icon: 'universal-access', label: 'Discapacitado' },
      'Motorcycle': { class: 'warning', icon: 'bicycle', label: 'Motocicleta' },
      'Loading': { class: 'secondary', icon: 'truck', label: 'Carga' }
    };
    
    const config = typeConfig[typeName] || { class: 'secondary', icon: 'car-front', label: typeName };
    
    return (
      <span className={`badge bg-${config.class}`}>
        <i className={`bi bi-${config.icon} me-1`}></i>
        {config.label}
      </span>
    );
  };

  const filteredParkingSpots = parkingSpots.filter(spot => {
    const matchesSearch = 
      spot.Parking_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      spot.Parking_status_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      spot.Parking_type_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      spot.Vehicle_type_name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || spot.Parking_status_name === statusFilter;
    const matchesType = typeFilter === 'all' || spot.Parking_type_name === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const getUniqueStatuses = () => {
    const statuses = [...new Set(parkingSpots.map(spot => spot.Parking_status_name).filter(Boolean))];
    return statuses;
  };

  const getUniqueTypes = () => {
    const types = [...new Set(parkingSpots.map(spot => spot.Parking_type_name).filter(Boolean))];
    return types;
  };

  if (loading) {
    return (
      <div className="parking-page">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="parking-page">
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="parking-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Gestión de Parqueaderos</h1>
          <p className="text-muted">Administre los espacios de estacionamiento del conjunto residencial</p>
        </div>
        <button className="btn btn-primary" onClick={handleCreate}>
          <i className="bi bi-plus-lg"></i> Nuevo Parqueadero
        </button>
      </div>

      <div className="filters-section">
        <div className="row g-3">
          <div className="col-md-4">
            <div className="search-box">
              <i className="bi bi-search"></i>
              <input
                type="text"
                className="form-control"
                placeholder="Buscar parqueadero..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-3">
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Todos los estados</option>
              {getUniqueStatuses().map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
          <div className="col-md-3">
            <select
              className="form-select"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">Todos los tipos</option>
              {getUniqueTypes().map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div className="col-md-2">
            <button className="btn btn-outline-secondary w-100" onClick={loadData}>
              <i className="bi bi-arrow-clockwise"></i> Actualizar
            </button>
          </div>
        </div>
      </div>

      <div className="parking-grid">
        {filteredParkingSpots.length === 0 ? (
          <div className="empty-state">
            <i className="bi bi-car-front display-1 text-muted"></i>
            <h3>No hay parqueaderos</h3>
            <p className="text-muted">
              {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                ? 'No se encontraron parqueaderos con los filtros aplicados'
                : 'Aún no hay parqueaderos registrados'}
            </p>
            {!searchTerm && statusFilter === 'all' && typeFilter === 'all' && (
              <button className="btn btn-primary" onClick={handleCreate}>
                <i className="bi bi-plus-lg"></i> Crear primer parqueadero
              </button>
            )}
          </div>
        ) : (
          <div className="row g-4">
            {filteredParkingSpots.map((spot) => (
              <div key={spot.Parking_id} className="col-xl-3 col-lg-4 col-md-6">
                <div className="parking-card">
                  <div className="card-header">
                    <div className="parking-number">
                      <i className="bi bi-car-front"></i>
                      <span>#{spot.Parking_number}</span>
                    </div>
                    <div className="card-actions">
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => handleView(spot)}
                        title="Ver detalles"
                      >
                        <i className="bi bi-eye"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => handleEdit(spot)}
                        title="Editar"
                      >
                        <i className="bi bi-pencil"></i>
                      </button>
                      {spot.User_ID_FK ? (
                        <button
                          className="btn btn-sm btn-outline-warning"
                          onClick={() => handleUnassign(spot)}
                          title="Desasignar propietario"
                        >
                          <i className="bi bi-person-dash"></i>
                        </button>
                      ) : (
                        <button
                          className="btn btn-sm btn-outline-success"
                          onClick={() => handleAssign(spot)}
                          title="Asignar propietario"
                        >
                          <i className="bi bi-person-plus"></i>
                        </button>
                      )}
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(spot)}
                        title="Eliminar"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>
                  <div className="card-body">
                    <div className="parking-info">
                      <div className="info-item">
                        <span className="label">Estado:</span>
                        <div className="status-toggle-container">
                          {getStatusBadge(spot.Parking_status_name)}
                          <div className="form-check form-switch">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id={`toggle-${spot.Parking_id}`}
                              checked={spot.Parking_status_name === 'Available'}
                              onChange={() => handleStatusToggle(spot)}
                              title={spot.Parking_status_name === 'Available' ? 'Marcar como Ocupado' : 'Marcar como Disponible'}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="info-item">
                        <span className="label">Tipo:</span>
                        {getTypeBadge(spot.Parking_type_name)}
                      </div>
                      {spot.Vehicle_type_name && (
                        <div className="info-item">
                          <span className="label">Vehículo:</span>
                          <span className="value">{spot.Vehicle_type_name}</span>
                        </div>
                      )}
                      <div className="info-item">
                        <span className="label">Propietario:</span>
                        <span className="value">
                          {spot.User_ID_FK ? (
                            <span className="badge bg-info">
                              <i className="bi bi-person-check me-1"></i>
                              Asignado
                            </span>
                          ) : (
                            <span className="badge bg-secondary">
                              <i className="bi bi-person-x me-1"></i>
                              Sin asignar
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="parking-stats">
        <div className="row g-3">
          <div className="col-md-3">
            <div className="stat-card">
              <div className="stat-icon bg-primary">
                <i className="bi bi-car-front"></i>
              </div>
              <div className="stat-info">
                <h3>{parkingSpots.length}</h3>
                <p>Total Parqueaderos</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="stat-card">
              <div className="stat-icon bg-success">
                <i className="bi bi-check-circle"></i>
              </div>
              <div className="stat-info">
                <h3>{parkingSpots.filter(spot => spot.Parking_status_name === 'Available').length}</h3>
                <p>Disponibles</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="stat-card">
              <div className="stat-icon bg-danger">
                <i className="bi bi-x-circle"></i>
              </div>
              <div className="stat-info">
                <h3>{parkingSpots.filter(spot => spot.Parking_status_name === 'Occupied').length}</h3>
                <p>Ocupados</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="stat-card">
              <div className="stat-icon bg-warning">
                <i className="bi bi-clock"></i>
              </div>
              <div className="stat-info">
                <h3>{parkingSpots.filter(spot => spot.Parking_status_name === 'Reserved').length}</h3>
                <p>Reservados</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <ParkingModal
          show={showModal}
          mode={modalMode}
          parking={editingParking}
          vehicleTypes={vehicleTypes}
          owners={owners}
          onClose={handleModalClose}
          onSubmit={handleModalSubmit}
        />
      )}

      {showAssignModal && (
        <AssignModal
          show={showAssignModal}
          parking={assigningParking}
          owners={owners}
          onClose={() => setShowAssignModal(false)}
          onSubmit={handleAssignSubmit}
        />
      )}
    </div>
  );
};

export default Parking; 