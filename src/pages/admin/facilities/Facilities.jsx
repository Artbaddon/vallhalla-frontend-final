import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { facilitiesAPI } from '../../../services/api';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import FacilityModal from './FacilityModal';
import './Facilities.css';

const Facilities = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingFacility, setEditingFacility] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const queryClient = useQueryClient();

  // Fetch facilities data
  const { data: response, isLoading, error } = useQuery('facilities', facilitiesAPI.getAll, {
    onSuccess: (response) => {
      console.log('Facilities data received:', response);
    },
    onError: (err) => {
      console.error('Error fetching facilities:', err);
    }
  });

  // Ensure facilities is always an array
  const facilities = Array.isArray(response) ? response : [];

  // Mutations
  const createMutation = useMutation(facilitiesAPI.create, {
    onSuccess: () => {
      queryClient.invalidateQueries('facilities');
      toast.success('Instalación creada exitosamente');
      setShowModal(false);
    },
    onError: (error) => {
      console.error('Create Facility Error:', error);
      toast.error(error.response?.data?.message || 'Error al crear instalación');
    }
  });

  const updateMutation = useMutation(
    ({ id, data }) => facilitiesAPI.update(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('facilities');
        toast.success('Instalación actualizada exitosamente');
        setShowModal(false);
        setEditingFacility(null);
      },
      onError: (error) => {
        console.error('Update Facility Error:', error);
        toast.error(error.response?.data?.message || 'Error al actualizar instalación');
      }
    }
  );

  const updateStatusMutation = useMutation(
    ({ id, status }) => facilitiesAPI.updateStatus(id, status),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('facilities');
        toast.success('Estado de la instalación actualizado exitosamente');
      },
      onError: (error) => {
        console.error('Update Status Error:', error);
        toast.error(error.response?.data?.message || 'Error al actualizar estado');
      }
    }
  );

  const deleteMutation = useMutation(facilitiesAPI.delete, {
    onSuccess: () => {
      queryClient.invalidateQueries('facilities');
      toast.success('Instalación eliminada exitosamente');
    },
    onError: (error) => {
      console.error('Delete Facility Error:', error);
      toast.error(error.response?.data?.message || 'Error al eliminar instalación');
    }
  });

  // Filter facilities based on search term and status
  const filteredFacilities = facilities.filter(facility => {
    const facilityName = facility.name || '';
    const facilityDescription = facility.description || '';
    const facilityStatus = facility.status || '';
    
    const matchesSearch = facilityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      facilityDescription.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || facilityStatus.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  const handleCreate = () => {
    setEditingFacility(null);
    setShowModal(true);
  };

  const handleEdit = (facility) => {
    setEditingFacility({
      id: facility.id,
      name: facility.name,
      description: facility.description,
      capacity: facility.capacity,
      status: facility.status
    });
    setShowModal(true);
  };

  const handleDelete = (facility) => {
    Swal.fire({
      title: '¿Está seguro?',
      text: "Esta acción no se puede deshacer",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        deleteMutation.mutate(facility.id);
      }
    });
  };

  const handleStatusChange = (facility, newStatus) => {
    updateStatusMutation.mutate({ id: facility.id, status: newStatus });
  };

  const handleSubmit = (formData) => {
    console.log('Form data submitted:', formData);
    
    if (editingFacility) {
      updateMutation.mutate({ id: editingFacility.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'available':
        return 'bg-success';
      case 'maintenance':
        return 'bg-warning text-dark';
      case 'reserved':
        return 'bg-primary';
      case 'unavailable':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  };

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        Error al cargar las instalaciones: {error.message}
      </div>
    );
  }

  return (
    <div className="facilities-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Gestión de Instalaciones</h1>
          <p className="text-muted">Administre las áreas comunes y espacios del conjunto residencial</p>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={handleCreate}
          disabled={isLoading}
        >
          <i className="bi bi-plus-lg"></i> Añadir Instalación
        </button>
      </div>

      {/* Search and Filters */}
      <div className="search-section">
        <div className="row">
          <div className="col-md-6">
            <div className="input-group">
              <span className="input-group-text">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Buscar instalaciones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-6">
            <div className="input-group">
              <span className="input-group-text">
                <i className="bi bi-filter"></i>
              </span>
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">Todos los estados</option>
                <option value="available">Disponible</option>
                <option value="maintenance">En mantenimiento</option>
                <option value="reserved">Reservado</option>
                <option value="unavailable">No disponible</option>
              </select>
              {statusFilter && (
                <button 
                  className="btn btn-outline-secondary" 
                  type="button"
                  onClick={() => setStatusFilter('')}
                >
                  <i className="bi bi-x"></i>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Facilities Table */}
      <div className="table-container">
        <div className="table-header">
          <h3>Lista de Instalaciones</h3>
          <span className="badge bg-primary">{filteredFacilities.length} instalaciones</span>
        </div>
        
        {isLoading ? (
          <div className="loading-container">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
            <p>Cargando instalaciones...</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Descripción</th>
                  <th>Capacidad</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredFacilities.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center text-muted py-4">
                      {searchTerm || statusFilter ? 'No se encontraron instalaciones con esos criterios' : 'No hay instalaciones registradas'}
                    </td>
                  </tr>
                ) : (
                  filteredFacilities.map((facility) => (
                    <tr key={facility.id}>
                      <td>{facility.name}</td>
                      <td>{facility.description}</td>
                      <td>{facility.capacity || 'N/A'}</td>
                      <td>
                        <span className={`badge ${getStatusBadgeClass(facility.status)}`}>
                          {facility.status || 'Desconocido'}
                        </span>
                      </td>
                      <td>
                        <div className="btn-group" role="group">
                          <button
                            type="button"
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => handleEdit(facility)}
                          >
                            <i className="bi bi-pencil"></i> Editar
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => handleDelete(facility)}
                          >
                            <i className="bi bi-trash"></i> Eliminar
                          </button>
                          <div className="btn-group" role="group">
                            <button
                              type="button"
                              className="btn btn-outline-secondary btn-sm dropdown-toggle"
                              data-bs-toggle="dropdown"
                              aria-expanded="false"
                            >
                              Estado
                            </button>
                            <ul className="dropdown-menu">
                              <li>
                                <button
                                  className="dropdown-item"
                                  onClick={() => handleStatusChange(facility, 'available')}
                                >
                                  <i className="bi bi-check-circle text-success me-2"></i>
                                  Disponible
                                </button>
                              </li>
                              <li>
                                <button
                                  className="dropdown-item"
                                  onClick={() => handleStatusChange(facility, 'maintenance')}
                                >
                                  <i className="bi bi-tools text-warning me-2"></i>
                                  En mantenimiento
                                </button>
                              </li>
                              <li>
                                <button
                                  className="dropdown-item"
                                  onClick={() => handleStatusChange(facility, 'reserved')}
                                >
                                  <i className="bi bi-calendar-check text-primary me-2"></i>
                                  Reservado
                                </button>
                              </li>
                              <li>
                                <button
                                  className="dropdown-item"
                                  onClick={() => handleStatusChange(facility, 'unavailable')}
                                >
                                  <i className="bi bi-x-circle text-danger me-2"></i>
                                  No disponible
                                </button>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Facility Modal */}
      {showModal && (
        <FacilityModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setEditingFacility(null);
          }}
          onSubmit={handleSubmit}
          facility={editingFacility}
        />
      )}
    </div>
  );
};

export default Facilities; 