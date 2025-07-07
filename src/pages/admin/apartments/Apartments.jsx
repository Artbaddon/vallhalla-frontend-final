import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { apartmentsAPI, towersAPI, apartmentStatusAPI, ownersAPI } from '../../../services/apiService';
import { toast } from 'react-hot-toast';
import DynamicModal from '../../../components/common/DynamicModal';
import './Apartments.css';

/**
 * Apartments management component
 * Displays a list of apartments with filtering and CRUD operations
 */
const Apartments = () => {
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTower, setFilterTower] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    type: null, // 'view', 'edit', 'create'
    data: null
  });

  const queryClient = useQueryClient();

  // Helper function to safely extract data from API responses
  const extractData = (response, dataKey = null) => {
    if (!response) return [];
    
    // Case 1: Response is already an array
    if (Array.isArray(response)) {
      return response;
    }
    
    // Case 2: Response has a data property that is an array
    if (response.data && Array.isArray(response.data)) {
      return response.data;
    }
    
    // Case 3: Response has a specific key that contains an array
    if (dataKey && response[dataKey] && Array.isArray(response[dataKey])) {
      return response[dataKey];
    }
    
    // Case 4: Response has a data property with a specific key that contains an array
    if (dataKey && response.data && response.data[dataKey] && Array.isArray(response.data[dataKey])) {
      return response.data[dataKey];
    }
    
    // Default: Return empty array if no valid data structure is found
    console.warn('Could not extract data from response:', response);
    return [];
  };

  // Queries
  const { 
    data: apartmentsData = { apartments: [] }, 
    isLoading: isLoadingApartments,
    isError: isErrorApartments,
    error: apartmentsError
  } = useQuery('apartments', apartmentsAPI.getAll, {
    onSuccess: (data) => {
      console.log('Apartments response:', data);
    },
    onError: (error) => {
      console.error('Error fetching apartments:', error);
      toast.error(`Error al cargar apartamentos: ${error.message}`);
    }
  });

  const { 
    data: towersData = { data: [] }, 
    isLoading: isLoadingTowers 
  } = useQuery('towers', towersAPI.getAll, {
    onSuccess: (data) => {
      console.log('Towers response:', data);
    },
    onError: (error) => {
      console.error('Error fetching towers:', error);
      toast.error(`Error al cargar torres: ${error.message}`);
    }
  });

  const { 
    data: statusesData = { data: [] },
    isLoading: isLoadingStatuses
  } = useQuery('apartmentStatuses', apartmentStatusAPI.getAll, {
    onSuccess: (data) => {
      console.log('Apartment statuses response:', data);
    },
    onError: (error) => {
      console.error('Error fetching apartment statuses:', error);
      toast.error(`Error al cargar estados: ${error.message}`);
    }
  });

  const { 
    data: ownersData = { owners: [] } 
  } = useQuery('owners', ownersAPI.getAll, {
    onSuccess: (data) => {
      console.log('Owners response:', data);
    },
    onError: (error) => {
      console.error('Error fetching owners:', error);
      toast.error(`Error al cargar propietarios: ${error.message}`);
    }
  });

  // Extract data from API responses
  const apartments = extractData(apartmentsData, 'apartments');
  const towers = extractData(towersData, 'data');
  const statuses = extractData(statusesData, 'data') || [];
  const owners = extractData(ownersData, 'owners');

  console.log('Extracted apartments:', apartments);
  console.log('Extracted towers:', towers);
  console.log('Extracted statuses:', statuses);
  console.log('Extracted owners:', owners);

  // Mutations
  const createMutation = useMutation(apartmentsAPI.create, {
    onSuccess: () => {
      queryClient.invalidateQueries('apartments');
      toast.success('Apartamento creado exitosamente');
      handleCloseModal();
    },
    onError: (error) => {
      toast.error(`Error al crear apartamento: ${error.message}`);
    }
  });

  const updateMutation = useMutation(
    ({ id, data }) => apartmentsAPI.update(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('apartments');
        toast.success('Apartamento actualizado exitosamente');
        handleCloseModal();
      },
      onError: (error) => {
        toast.error(`Error al actualizar apartamento: ${error.message}`);
      }
    }
  );

  const deleteMutation = useMutation(apartmentsAPI.delete, {
    onSuccess: () => {
      queryClient.invalidateQueries('apartments');
      toast.success('Apartamento eliminado exitosamente');
    },
    onError: (error) => {
      toast.error(`Error al eliminar apartamento: ${error.message}`);
    }
  });

  // Helper function to get status badge color
  const getStatusBadgeColor = (statusName) => {
    if (!statusName) return 'secondary';
    
    switch(statusName.toLowerCase()) {
      case 'available':
      case 'disponible':
        return 'success';
      case 'occupied':
      case 'ocupado':
        return 'warning';
      case 'maintenance':
      case 'mantenimiento':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  // Filter apartments based on search term and filters
  const filteredApartments = apartments.filter(apartment => {
    const matchesSearch = !searchTerm || 
      (apartment.Apartment_number && apartment.Apartment_number.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesTower = !filterTower || apartment.Tower_FK_ID === parseInt(filterTower);
    const matchesStatus = !filterStatus || apartment.Apartment_status_FK_ID === parseInt(filterStatus);
    return matchesSearch && matchesTower && matchesStatus;
  });

  // Modal handlers
  const handleView = (apartment) => {
    setModalConfig({
      isOpen: true,
      type: 'view',
      data: apartment
    });
  };

  const handleEdit = (apartment) => {
    setModalConfig({
      isOpen: true,
      type: 'edit',
      data: apartment
    });
  };

  const handleCreate = () => {
    setModalConfig({
      isOpen: true,
      type: 'create',
      data: null
    });
  };

  const handleCloseModal = () => {
    setModalConfig({
      isOpen: false,
      type: null,
      data: null
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de que desea eliminar este apartamento?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  // Form submission handler
  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    
    const data = {
      apartment_number: formData.get('apartment_number'),
      tower_id: parseInt(formData.get('tower_id')),
      status_id: parseInt(formData.get('status_id')),
      owner_id: parseInt(formData.get('owner_id'))
    };

    try {
      if (modalConfig.type === 'edit') {
        await updateMutation.mutateAsync({
          id: modalConfig.data.Apartment_id,
          data
        });
      } else {
        await createMutation.mutateAsync(data);
      }
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  // Modal content renderer
  const renderModalContent = () => {
    const { type, data } = modalConfig;

    switch (type) {
      case 'view':
        return (
          <div className="apartment-details">
            <div className="mb-3">
              <label className="form-label fw-bold">Número:</label>
              <p>{data?.Apartment_number}</p>
            </div>
            <div className="mb-3">
              <label className="form-label fw-bold">Torre:</label>
              <p>{data?.Tower_name || 'N/A'}</p>
            </div>
            <div className="mb-3">
              <label className="form-label fw-bold">Estado:</label>
              <p>
                <span className={`badge bg-${getStatusBadgeColor(data?.Apartment_status_name)}`}>
                  {data?.Apartment_status_name || 'N/A'}
                </span>
              </p>
            </div>
            <div className="mb-3">
              <label className="form-label fw-bold">Propietario:</label>
              <p>{data?.owner_name || 'N/A'}</p>
            </div>
          </div>
        );

      case 'edit':
      case 'create':
        return (
          <>
            <div className="mb-3">
              <label htmlFor="apartment_number" className="form-label">Número de Apartamento</label>
              <input
                type="text"
                className="form-control"
                id="apartment_number"
                name="apartment_number"
                defaultValue={data?.Apartment_number || ''}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="tower_id" className="form-label">Torre</label>
              <select
                className="form-select"
                id="tower_id"
                name="tower_id"
                defaultValue={data?.Tower_FK_ID || ''}
                required
              >
                <option value="">Seleccione una torre</option>
                {towers.map((tower, index) => (
                  <option key={`tower-${tower.id || index}`} value={tower.id}>
                    {tower.Tower_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label htmlFor="status_id" className="form-label">Estado</label>
              <select
                className="form-select"
                id="status_id"
                name="status_id"
                defaultValue={data?.Apartment_status_FK_ID || ''}
                required
              >
                <option value="">Seleccione un estado</option>
                {statuses.map((status, index) => (
                  <option key={`status-${status.id || index}`} value={status.id}>
                    {status.name || status.status_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label htmlFor="owner_id" className="form-label">Propietario</label>
              <select
                className="form-select"
                id="owner_id"
                name="owner_id"
                defaultValue={data?.Owner_FK_ID || ''}
                required
              >
                <option value="">Seleccione un propietario</option>
                {owners.map((owner, index) => (
                  <option key={`owner-${owner.id || index}`} value={owner.id}>
                    {`${owner.first_name} ${owner.last_name}`}
                  </option>
                ))}
              </select>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  // Loading state
  if (isLoadingApartments || isLoadingTowers || isLoadingStatuses) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '70vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (isErrorApartments) {
    return (
      <div className="alert alert-danger" role="alert">
        Error al cargar los datos: {apartmentsError.message}
      </div>
    );
  }

  return (
    <div className="apartments-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-0">Gestión de Apartamentos</h1>
          <p className="text-muted">Administre los apartamentos del conjunto residencial</p>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={handleCreate}
          disabled={createMutation.isLoading}
        >
          <i className="bi bi-plus-circle me-1"></i>
          Nuevo Apartamento
        </button>
      </div>

      {/* Filters */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <label htmlFor="tower-filter" className="form-label">Filtrar por Torre</label>
              <select
                id="tower-filter"
                className="form-select"
                value={filterTower}
                onChange={(e) => setFilterTower(e.target.value)}
              >
                <option value="">Todas las torres</option>
                {towers.map((tower, index) => (
                  <option key={`tower-filter-${tower.id}-${index}`} value={tower.id}>
                    {tower.Tower_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <label htmlFor="status-filter" className="form-label">Filtrar por Estado</label>
              <select
                id="status-filter"
                className="form-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">Todos los estados</option>
                {statuses.map((status, index) => (
                  <option key={`status-filter-${status.id}-${index}`} value={status.id}>
                    {status.name || status.status_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <label htmlFor="search-apartment" className="form-label">Buscar</label>
              <input
                id="search-apartment"
                type="text"
                className="form-control"
                placeholder="Buscar por número..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      {filteredApartments.length > 0 ? (
        <div className="card">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Número</th>
                  <th>Torre</th>
                  <th>Estado</th>
                  <th>Propietario</th>
                  <th className="text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredApartments.map((apartment, index) => (
                  <tr key={`apartment-${apartment.Apartment_id}-${index}`}>
                    <td>{apartment.Apartment_number}</td>
                    <td>{apartment.Tower_name || 'N/A'}</td>
                    <td>
                      <span className={`badge bg-${getStatusBadgeColor(apartment.Apartment_status_name)}`}>
                        {apartment.Apartment_status_name || 'N/A'}
                      </span>
                    </td>
                    <td>{apartment.owner_name || 'N/A'}</td>
                    <td className="text-end">
                      <div className="btn-group btn-group-sm">
                        <button
                          className="btn btn-outline-info"
                          onClick={() => handleView(apartment)}
                          title="Ver detalles"
                        >
                          <i className="bi bi-eye"></i>
                        </button>
                        <button
                          className="btn btn-outline-primary"
                          onClick={() => handleEdit(apartment)}
                          title="Editar"
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button
                          className="btn btn-outline-danger"
                          onClick={() => handleDelete(apartment.Apartment_id)}
                          disabled={deleteMutation.isLoading}
                          title="Eliminar"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="alert alert-info">
          No se encontraron apartamentos que coincidan con los criterios de búsqueda.
        </div>
      )}

      {/* Modal */}
      <DynamicModal
        isOpen={modalConfig.isOpen}
        onClose={handleCloseModal}
        title={
          modalConfig.type === 'view' ? 'Detalles del Apartamento' :
          modalConfig.type === 'edit' ? 'Editar Apartamento' :
          'Nuevo Apartamento'
        }
        onSubmit={modalConfig.type !== 'view' ? handleSubmit : undefined}
        submitText={
          createMutation.isLoading || updateMutation.isLoading 
            ? 'Guardando...' 
            : modalConfig.type === 'edit' 
              ? 'Actualizar' 
              : 'Crear'
        }
        showFooter={true}
        size="lg"
      >
        {renderModalContent()}
      </DynamicModal>
    </div>
  );
};

export default Apartments; 