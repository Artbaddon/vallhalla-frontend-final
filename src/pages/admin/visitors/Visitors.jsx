import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { visitorsAPI } from '../../../services/api';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import VisitorModal from './VisitorModal';
import './Visitors.css';

const Visitors = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingVisitor, setEditingVisitor] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const queryClient = useQueryClient();

  // Fetch visitors data
  const { data: response, isLoading, error } = useQuery('visitors', visitorsAPI.getAll, {
    onSuccess: (response) => {
      console.log('Visitors data received:', response);
    },
    onError: (err) => {
      console.error('Error fetching visitors:', err);
      toast.error('Error al cargar los visitantes');
    }
  });

  // Ensure visitors is always an array
  const visitors = response?.visitors || [];

  console.log('Visitors data:', visitors);
  console.log('Sample visitor:', visitors[0]);
  console.log('Date filter:', dateFilter);

  // Mutations
  const createMutation = useMutation(visitorsAPI.create, {
    onSuccess: () => {
      queryClient.invalidateQueries('visitors');
      toast.success('Visitante registrado exitosamente');
      setShowModal(false);
    },
    onError: (error) => {
      console.error('Create Visitor Error:', error);
      toast.error(error.response?.data?.message || 'Error al registrar visitante');
    }
  });

  const updateMutation = useMutation(
    ({ id, data }) => visitorsAPI.update(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('visitors');
        toast.success('Visitante actualizado exitosamente');
        setShowModal(false);
        setEditingVisitor(null);
      },
      onError: (error) => {
        console.error('Update Visitor Error:', error);
        toast.error(error.response?.data?.message || 'Error al actualizar visitante');
      }
    }
  );

  const updateExitMutation = useMutation(
    ({ id }) => visitorsAPI.visitorExit(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('visitors');
        toast.success('Fecha de salida actualizada exitosamente');
      },
      onError: (error) => {
        console.error('Update Exit Date Error:', error);
        toast.error(error.response?.data?.message || 'Error al actualizar fecha de salida');
      }
    }
  );

  const deleteMutation = useMutation(visitorsAPI.delete, {
    onSuccess: () => {
      queryClient.invalidateQueries('visitors');
      toast.success('Visitante eliminado exitosamente');
    },
    onError: (error) => {
      console.error('Delete Visitor Error:', error);
      toast.error(error.response?.data?.message || 'Error al eliminar visitante');
    }
  });

  // Filter visitors based on search term and date
  const filteredVisitors = visitors.filter(visitor => {
    const visitorName = visitor.name || '';
    const visitorDocument = visitor.documentNumber || '';
    const hostName = visitor.host_name || '';
    
    // For date filtering, we need to compare dates properly
    let matchesDate = true;
    if (dateFilter) {
      try {
        // Get the visitor's enter date and extract just the date part
        const visitorEnterDate = visitor.enter_date;
        if (visitorEnterDate) {
          // Convert visitor date to local date string (YYYY-MM-DD)
          const visitorDate = new Date(visitorEnterDate);
          const visitorDateStr = visitorDate.getFullYear() + '-' + 
            String(visitorDate.getMonth() + 1).padStart(2, '0') + '-' + 
            String(visitorDate.getDate()).padStart(2, '0');
          
          // Compare with filter date
          matchesDate = visitorDateStr === dateFilter;
          
          // Debug logging
          console.log('Date comparison:', {
            filterDate: dateFilter,
            visitorRawDate: visitorEnterDate,
            visitorParsedDate: visitorDateStr,
            matches: matchesDate
          });
        } else {
          matchesDate = false;
        }
      } catch (error) {
        console.error('Date parsing error:', error);
        matchesDate = false;
      }
    }
    
    // Search should work on name, document, or host name
    const matchesSearch = !searchTerm || 
      visitorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visitorDocument.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hostName.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch && matchesDate;
  });

  const handleCreate = () => {
    setEditingVisitor(null);
    setShowModal(true);
  };

  const handleView = (visitor) => {
    // Create a view-only version of the visitor data
    setEditingVisitor({
      id: visitor.ID,
      name: visitor.name,
      documentNumber: visitor.documentNumber,
      hostId: visitor.host,
      hostName: visitor.host_name,
      enterDate: visitor.enter_date,
      exitDate: visitor.exit_date,
      isViewOnly: true
    });
    setShowModal(true);
  };

  const handleEdit = (visitor) => {
    setEditingVisitor({
      id: visitor.ID,
      name: visitor.name,
      documentNumber: visitor.documentNumber,
      hostId: visitor.host,
      enterDate: visitor.enter_date,
      isViewOnly: false
    });
    setShowModal(true);
  };

  const handleMarkExit = (visitor) => {
    if (visitor.exit_date) {
      toast.info('Este visitante ya tiene fecha de salida registrada');
      return;
    }

    Swal.fire({
      title: '¿Marcar salida del visitante?',
      text: `Se registrará la salida de ${visitor.name} con la fecha y hora actual`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, marcar salida',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        const currentDateTime = new Date().toISOString();
        updateExitMutation.mutate({ 
          id: visitor.ID, 
          exitDate: currentDateTime 
        });
      }
    });
  };

  const handleDelete = (visitor) => {
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
        deleteMutation.mutate(visitor.ID);
      }
    });
  };

  const handleSubmit = (formData) => {
    console.log('Form data submitted:', formData);
    
    const apiData = {
      visitor_name: formData.name,
      document_number: formData.documentNumber,
      host_id: formData.hostId,
      enter_date: formData.enterDate
    };
    
    if (editingVisitor) {
      updateMutation.mutate({ id: editingVisitor.id, data: apiData });
    } else {
      createMutation.mutate(apiData);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        Error al cargar los visitantes: {error.message}
      </div>
    );
  }

  return (
    <div className="visitors-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Gestión de Visitantes</h1>
          <p className="text-muted">Administre los visitantes del conjunto residencial</p>
        </div>
        <button 
          className="btn btn-outline-primary" 
          onClick={handleCreate}
          disabled={isLoading}
        >
          <i className="bi bi-plus-lg"></i> Registrar Visitante
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
                placeholder="Buscar por nombre o documento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-6">
            <div className="input-group">
              <span className="input-group-text">
                <i className="bi bi-calendar"></i>
              </span>
              <input
                type="date"
                className="form-control"
                placeholder="Filtrar por fecha"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
              {dateFilter && (
                <button 
                  className="btn btn-outline-secondary" 
                  type="button"
                  onClick={() => setDateFilter('')}
                >
                  <i className="bi bi-x"></i>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Visitors Table */}
      <div className="table-container">
        <div className="table-header">
          <h3>Lista de Visitantes</h3>
          <span className="badge bg-primary">{filteredVisitors.length} visitantes</span>
        </div>
        
        {isLoading ? (
          <div className="loading-container">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
            <p>Cargando visitantes...</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Documento</th>
                  <th>Fecha de Entrada</th>
                  <th>Fecha de Salida</th>
                  <th>Anfitrión</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredVisitors.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center text-muted py-4">
                      {searchTerm || dateFilter ? 'No se encontraron visitantes con esos criterios' : 'No hay visitantes registrados'}
                    </td>
                  </tr>
                ) : (
                  filteredVisitors.map((visitor) => (
                    <tr key={visitor.ID}>
                      <td>{visitor.name}</td>
                      <td>{visitor.documentNumber}</td>
                      <td>{formatDate(visitor.enter_date)}</td>
                      <td>{formatDate(visitor.exit_date) || 'Aún presente'}</td>
                      <td>{visitor.host_name || `ID: ${visitor.host}`}</td>
                      <td>
                        <div className="btn-group" role="group">
                          <button
                            type="button"
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => handleView(visitor)}
                          >
                            <i className="bi bi-eye"></i> Ver
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => handleEdit(visitor)}
                          >
                            <i className="bi bi-pencil"></i> Editar
                          </button>
                          {!visitor.exit_date && (
                            <button
                              type="button"
                              className="btn btn-outline-success btn-sm"
                              onClick={() => handleMarkExit(visitor)}
                              title="Marcar salida"
                            >
                              <i className="bi bi-box-arrow-right"></i> Salida
                            </button>
                          )}
                          <button
                            type="button"
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => handleDelete(visitor)}
                          >
                            <i className="bi bi-trash"></i> Eliminar
                          </button>
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

      {/* Visitor Modal */}
      {showModal && (
        <VisitorModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setEditingVisitor(null);
          }}
          onSubmit={handleSubmit}
          visitor={editingVisitor}
        />
      )}
    </div>
  );
};

export default Visitors; 