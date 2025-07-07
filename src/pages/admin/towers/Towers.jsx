import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { towersAPI } from '../../../services/api';
import { toast } from 'react-hot-toast';
import './Towers.css';

const Towers = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingTower, setEditingTower] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  // Fetch towers
  const { data: towersResponse, isLoading } = useQuery(
    'towers',
    towersAPI.getAll,
    {
      onSuccess: (data) => {
        console.log('Towers response:', data);
      },
      onError: (error) => {
        console.error('Error fetching towers:', error);
        toast.error('Error al cargar las torres');
      }
    }
  );

  // Create tower mutation
  const createMutation = useMutation(
    (newTower) => towersAPI.create(newTower),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('towers');
        toast.success('Torre creada exitosamente');
        setShowModal(false);
      },
      onError: (error) => {
        console.error('Create Error:', error);
        toast.error(error.response?.data?.message || 'Error al crear la torre');
      }
    }
  );

  // Update tower mutation
  const updateMutation = useMutation(
    ({ id, data }) => towersAPI.update(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('towers');
        toast.success('Torre actualizada exitosamente');
        setShowModal(false);
        setEditingTower(null);
      },
      onError: (error) => {
        console.error('Update Error:', error);
        toast.error(error.response?.data?.message || 'Error al actualizar la torre');
      }
    }
  );

  // Delete tower mutation
  const deleteMutation = useMutation(
    (id) => towersAPI.delete(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('towers');
        toast.success('Torre eliminada exitosamente');
      },
      onError: (error) => {
        console.error('Delete Error:', error);
        toast.error(error.response?.data?.message || 'Error al eliminar la torre');
      }
    }
  );

  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const towerData = {
      Tower_name: formData.get('tower_name')
    };

    if (editingTower) {
      const towerId = editingTower.id || editingTower.Tower_id;
      updateMutation.mutate({ id: towerId, data: towerData });
    } else {
      createMutation.mutate(towerData);
    }
  };

  const handleEdit = (tower) => {
    setEditingTower(tower);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Está seguro que desea eliminar esta torre?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleAddNew = () => {
    setEditingTower(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTower(null);
  };

  // Extract towers data safely, handling different API response structures
  const extractTowers = () => {
    if (!towersResponse) return [];
    
    // Handle different response structures
    if (Array.isArray(towersResponse)) {
      return towersResponse;
    }
    
    if (towersResponse.data && Array.isArray(towersResponse.data)) {
      return towersResponse.data;
    }
    
    if (towersResponse.data && towersResponse.data.data && Array.isArray(towersResponse.data.data)) {
      return towersResponse.data.data;
    }
    
    return [];
  };
  
  const towersArray = extractTowers();
  
  // Add debugging for tower objects
  console.log('Towers array:', towersArray);
  
  // Filter towers based on search term
  const filteredTowers = towersArray.filter(tower => {
    // Check if Tower_name exists and is a string before calling toLowerCase
    const towerName = tower.Tower_name || '';
    return typeof towerName === 'string' && towerName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="towers-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Gestión de Torres</h1>
          <p className="text-muted">Administre las torres del conjunto residencial</p>
        </div>
        <button className="btn btn-primary" onClick={handleAddNew}>
          <i className="bi bi-plus-lg"></i> Añadir Torre
        </button>
      </div>

      <div className="filters-container">
        <div className="row">
          <div className="col-md-6">
            <div className="input-group mb-3">
              <span className="input-group-text">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Buscar por nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      ) : filteredTowers.length > 0 ? (
        <div className="row tower-cards">
          {filteredTowers.map(tower => (
            <div className="col-md-4 mb-4" key={tower.id || tower.Tower_id}>
              <div className="card tower-card">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="card-title">
                      <i className="bi bi-buildings me-2"></i>
                      {tower.Tower_name}
                    </h5>
                    <div className="tower-actions">
                      <button
                        className="btn btn-sm btn-outline-primary me-2"
                        onClick={() => handleEdit(tower)}
                      >
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(tower.id || tower.Tower_id)}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center my-5">
          <p>No se encontraron torres.</p>
        </div>
      )}

      {/* Add/Edit Tower Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingTower ? 'Editar Torre' : 'Añadir Torre'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeModal}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="tower_name" className="form-label">Nombre de la Torre</label>
                    <input
                      type="text"
                      className="form-control"
                      id="tower_name"
                      name="tower_name"
                      defaultValue={editingTower?.Tower_name || ''}
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeModal}>
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={createMutation.isLoading || updateMutation.isLoading}
                  >
                    {(createMutation.isLoading || updateMutation.isLoading) ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Guardando...
                      </>
                    ) : (
                      'Guardar'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Towers; 