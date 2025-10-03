import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { paymentsAPI, ownersAPI } from '../../../services/api';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import PaymentModal from './PaymentModal';
import './Payments.css';
import useFeatureAccess from '../../../hooks/useFeatureAccess';
import { useAuth } from '../../../contexts/AuthContext';

const Payments = () => {
  const { can: paymentsCan, roleKey } = useFeatureAccess('payments');
  const { user } = useAuth();
  const canView = paymentsCan.canView;
  const canCreate = paymentsCan.canCreate;
  const canEdit = paymentsCan.canEdit;
  const isAdminRole = roleKey === 'ADMIN';
  const isOwnerRole = roleKey === 'OWNER';

  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const queryClient = useQueryClient();

  // Fetch payments data
  const { data: paymentsResponse, isLoading, error } = useQuery('payments', paymentsAPI.getAll, {
    enabled: canView,
    onSuccess: (response) => {
      console.log('Payments data received:', response?.data);
    },
    onError: (err) => {
      console.error('Error fetching payments:', err);
    }
  });

  // Fetch owners for bulk creation - try getDetails first, fallback to getAll
  const shouldLoadOwners = canCreate && isAdminRole;
  const { data: ownersResponse } = useQuery(
    'owners', 
    async () => {
      try {
        // Try getDetails first (returns more complete data)
        const detailsResult = await ownersAPI.getDetails();
        console.log('Owners getDetails result:', detailsResult);
        return { data: detailsResult };
      } catch (err) {
        console.log('getDetails failed, trying getAll:', err);
        // Fallback to getAll
        return await ownersAPI.getAll();
      }
    },
    {
      enabled: shouldLoadOwners,
      onSuccess: (data) => {
        console.log('Owners API response in Payments:', data);
        console.log('Owners data structure:', data?.data);
      },
      onError: (err) => {
        console.error('Error loading owners in Payments:', err);
      }
    }
  );
  
  // Fallback owners for testing when API is empty
  const fallbackOwners = useMemo(() => [
    { Owner_id: 1, Owner_first_name: 'Juan', Owner_last_name: 'Pérez' },
    { Owner_id: 2, Owner_first_name: 'María', Owner_last_name: 'García' },
    { Owner_id: 3, Owner_first_name: 'Carlos', Owner_last_name: 'López' },
    { Owner_id: 4, Owner_first_name: 'Ana', Owner_last_name: 'Martínez' },
    { Owner_id: 5, Owner_first_name: 'Luis', Owner_last_name: 'Rodríguez' }
  ], []);
  
  const owners = useMemo(() => {
    if (!canCreate) {
      return [];
    }

    if (shouldLoadOwners) {
      const ownersFromAPI = ownersResponse?.data || [];
      const resolvedOwners = ownersFromAPI.length > 0 ? ownersFromAPI : fallbackOwners;
      console.log('Final owners array in Payments (admin path):', resolvedOwners);
      console.log('Using fallback owners?', ownersFromAPI?.length === 0);
      return resolvedOwners;
    }

    if (isOwnerRole) {
      const ownerSelf = {
        Owner_id: user?.userId ?? null,
        Owner_first_name: user?.username ?? 'Mi',
        Owner_last_name: 'Cuenta',
      };
      return ownerSelf.Owner_id != null ? [ownerSelf] : [];
    }

    return [];
  }, [canCreate, fallbackOwners, isOwnerRole, shouldLoadOwners, user?.userId, user?.username, ownersResponse?.data]);

  // Ensure payments is always an array
  const payments = Array.isArray(paymentsResponse?.data) ? paymentsResponse.data : [];

  // Status mapping functions
  const getStatusFromId = (statusId) => {
    const statusMap = {
      1: 'pending',
      2: 'completed', 
      3: 'failed',
      4: 'cancelled'
    };
    return statusMap[statusId] || 'pending';
  };

  // Mutations
  const createMutation = useMutation(paymentsAPI.create, {
    onSuccess: () => {
      queryClient.invalidateQueries('payments');
      toast.success('Pago creado exitosamente - Propietario puede proceder a pagarlo');
      setShowModal(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al crear pago');
    }
  });

  const updateMutation = useMutation(
    ({ id, data }) => paymentsAPI.update(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('payments');
        toast.success('Estado del pago actualizado exitosamente');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Error al actualizar estado del pago');
      }
    }
  );

  // Filter payments based on search term and status
  const filteredPayments = payments.filter(payment => {
    const ownerName = payment.owner_name || payment.ownerName || '';
    const referenceNumber = payment.Payment_reference_number || payment.referenceNumber || '';
    const description = payment.description || '';
    
    const matchesSearch = 
      ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      referenceNumber.includes(searchTerm) ||
      description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Map backend status to frontend status
    const backendStatus = payment.Payment_Status_ID_FK || payment.status_id;
    const frontendStatus = getStatusFromId(backendStatus);
    const matchesStatus = statusFilter === 'all' || frontendStatus === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleCreate = () => {
    if (!canCreate) return;
    setShowModal(true);
  };

  const handleChangeStatus = (payment) => {
    if (!canEdit) return;
    const currentStatusId = payment.Payment_Status_ID_FK || payment.status_id || 1;
    const statusOptions = {
      1: 'Pendiente',
      2: 'Completado', 
      3: 'Fallido',
      4: 'Cancelado'
    };

    Swal.fire({
      title: 'Cambiar Estado del Pago',
      html: `
        <div class="text-start">
          <p><strong>Pago ID:</strong> ${payment.payment_id || payment.id}</p>
          <p><strong>Propietario:</strong> ${payment.owner_name || 'N/A'}</p>
          <p><strong>Monto:</strong> $${(payment.Payment_total_payment || payment.amount || 0).toLocaleString()}</p>
          <p><strong>Estado Actual:</strong> ${statusOptions[currentStatusId]}</p>
          <hr>
          <label for="newStatus" class="form-label"><strong>Nuevo Estado:</strong></label>
          <select id="newStatus" class="form-select">
            <option value="1" ${currentStatusId === 1 ? 'selected' : ''}>Pendiente</option>
            <option value="2" ${currentStatusId === 2 ? 'selected' : ''}>Completado</option>
            <option value="3" ${currentStatusId === 3 ? 'selected' : ''}>Fallido</option>
            <option value="4" ${currentStatusId === 4 ? 'selected' : ''}>Cancelado</option>
          </select>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Cambiar Estado',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#198754',
      preConfirm: () => {
        const newStatusId = document.getElementById('newStatus').value;
        if (newStatusId === currentStatusId.toString()) {
          Swal.showValidationMessage('Debe seleccionar un estado diferente');
          return false;
        }
        return parseInt(newStatusId);
      }
    }).then((result) => {
      if (result.isConfirmed && canEdit) {
        updateMutation.mutate({ 
          id: payment.payment_id || payment.id, 
          data: { status_id: result.value }
        });
      }
    });
  };

  const handleView = (payment) => {
    const statusId = payment.Payment_Status_ID_FK || payment.status_id;
    const status = getStatusFromId(statusId);
    const statusNames = {
      pending: 'Pendiente',
      completed: 'Completado',
      failed: 'Fallido',
      cancelled: 'Cancelado'
    };
    
    Swal.fire({
      title: 'Detalles del Pago',
      html: `
        <div class="text-start">
          <p><strong>ID:</strong> ${payment.payment_id || payment.id || 'N/A'}</p>
          <p><strong>Propietario:</strong> ${payment.owner_name || payment.ownerName || 'N/A'}</p>
          <p><strong>Tipo:</strong> ${payment.payment_type || 'N/A'}</p>
          <p><strong>Descripción:</strong> ${payment.description || 'Sin descripción'}</p>
          <p><strong>Monto:</strong> $${(payment.Payment_total_payment || payment.amount || 0).toLocaleString()}</p>
          <p><strong>Estado:</strong> ${statusNames[status] || 'Desconocido'}</p>
          <p><strong>Fecha:</strong> ${new Date(payment.Payment_date || payment.date || Date.now()).toLocaleDateString()}</p>
          <p><strong>Método:</strong> ${payment.Payment_method || payment.paymentMethod || 'N/A'}</p>
          <p><strong>Referencia:</strong> ${payment.Payment_reference_number || payment.referenceNumber || 'N/A'}</p>
        </div>
      `,
      confirmButtonText: 'Cerrar'
    });
  };

  const handleSubmit = async (formData) => {
    if (!canCreate) return;

    if (formData.owner_id === 'all') {
      // Bulk creation for all owners
      if (!owners.length) {
        toast.error('No hay propietarios disponibles para crear pagos.');
        return;
      }
      let successCount = 0;
      let failCount = 0;
      for (const owner of owners) {
        try {
          await paymentsAPI.create({ ...formData, owner_id: owner.Owner_id });
          successCount++;
        } catch (err) {
          failCount++;
          console.error('Error creating payment for owner', owner.Owner_id, err);
        }
      }
      queryClient.invalidateQueries('payments');
      setShowModal(false);
      toast.success(`Pagos creados: ${successCount}, fallidos: ${failCount}`);
    } else {
      // Single owner
      createMutation.mutate(formData);
    }
  };

  const getStatusBadge = (payment) => {
    const statusId = payment.Payment_Status_ID_FK || payment.status_id;
    const status = getStatusFromId(statusId);
    
    const statusConfig = {
      pending: { class: 'bg-warning', text: 'Pendiente' },
      completed: { class: 'bg-success', text: 'Completado' },
      failed: { class: 'bg-danger', text: 'Fallido' },
      cancelled: { class: 'bg-secondary', text: 'Cancelado' }
    };
    
    const config = statusConfig[status] || { class: 'bg-secondary', text: 'Desconocido' };
    
    return <span className={`badge ${config.class}`}>{config.text}</span>;
  };

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        Error al cargar los pagos: {error.message}
      </div>
    );
  }

  if (!canView) {
    return (
      <div className="alert alert-warning" role="alert">
        No tienes permisos para visualizar esta sección.
      </div>
    );
  }

  return (
    <div className="payments-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Gestión de Pagos</h1>
          <p className="text-muted">Administre los pagos y transacciones del conjunto</p>
        </div>
        {canCreate && (
          <button 
            className="btn btn-outline-primary" 
            onClick={handleCreate}
            disabled={isLoading}
          >
            <i className="bi bi-plus-lg"></i> Crear Pago
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="filters-section">
        <div className="row">
          <div className="col-md-6">
            <div className="input-group">
              <span className="input-group-text">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Buscar pagos..."
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
              <option value="pending">Pendiente</option>
              <option value="completed">Completado</option>
              <option value="failed">Fallido</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>
          <div className="col-md-3">
            <div className="stats-summary">
              <div className="stat-item">
                <span className="stat-label">Total:</span>
                <span className="stat-value">
                  ${payments.reduce((sum, p) => sum + (p.Payment_total_payment || p.amount || 0), 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="table-container">
        <div className="table-header">
          <h3>Lista de Pagos</h3>
          <span className="badge bg-primary">{filteredPayments.length} pagos</span>
        </div>
        
        {isLoading ? (
          <div className="loading-container">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
            <p>Cargando pagos...</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Propietario</th>
                  <th>Descripción</th>
                  <th>Monto</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                  <th>Método</th>
                  <th>Referencia</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center text-muted py-4">
                      {searchTerm || statusFilter !== 'all' 
                        ? 'No se encontraron pagos con ese criterio' 
                        : 'No hay pagos registrados'}
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((payment) => (
                    <tr key={payment.payment_id || payment.id}>
                      <td>{payment.owner_name || payment.ownerName || 'N/A'}</td>
                      <td>
                        <>
                          {payment.description || 'Sin descripción'}
                          {payment.payment_type && (
                            <>
                              <br />
                              <small className="text-muted">({payment.payment_type})</small>
                            </>
                          )}
                        </>
                      </td>
                      <td>${(payment.Payment_total_payment || payment.amount || 0).toLocaleString()}</td>
                      <td>{getStatusBadge(payment)}</td>
                      <td>{new Date(payment.Payment_date || payment.date || Date.now()).toLocaleDateString()}</td>
                      <td>{payment.Payment_method || payment.paymentMethod || 'N/A'}</td>
                      <td>{payment.Payment_reference_number || payment.referenceNumber || 'N/A'}</td>
                      <td>
                        <div className="btn-group" role="group">
                          <button
                            type="button"
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => handleView(payment)}
                            title="Ver detalles"
                          >
                            <i className="bi bi-eye"></i>
                          </button>
                          {canEdit && (
                            <button
                              type="button"
                              className="btn btn-outline-warning btn-sm"
                              onClick={() => handleChangeStatus(payment)}
                              title="Cambiar estado"
                            >
                              <i className="bi bi-arrow-repeat"></i>
                            </button>
                          )}
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

      {/* Payment Modal */}
      <PaymentModal
        show={showModal && canCreate}
        onHide={() => {
          setShowModal(false);
        }}
        onSubmit={handleSubmit}
        payment={null}
        isLoading={createMutation.isLoading}
        owners={owners}
        allowBulk={shouldLoadOwners}
        isOwnerRole={isOwnerRole}
      />
    </div>
  );
};

export default Payments; 