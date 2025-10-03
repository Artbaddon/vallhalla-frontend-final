import React, { useMemo, useState } from 'react';
import { useMutation } from 'react-query';
import { facilitiesAPI } from '../../../services/api';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import FacilityModal from './FacilityModal';
import {
  AdminPageLayout,
  ResourceToolbar,
  DataTable,
} from '../../../components/common';
import useCrudResource from '../../../hooks/useCrudResource';
import './Facilities.css';

const STATUS_OPTIONS = [
  { value: 'available', label: 'Disponible' },
  { value: 'maintenance', label: 'En mantenimiento' },
  { value: 'reserved', label: 'Reservado' },
  { value: 'unavailable', label: 'No disponible' },
];

const getStatusBadgeClass = (status) => {
  switch ((status || '').toLowerCase()) {
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

const Facilities = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingFacility, setEditingFacility] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const facilitiesResource = useCrudResource({
    queryKey: 'facilities',
    fetcher: facilitiesAPI.getAll,
    select: (data) => (Array.isArray(data) ? data : data?.data ?? []),
    resourceLabel: { singular: 'instalación', plural: 'instalaciones' },
    createFn: facilitiesAPI.create,
    updateFn: ({ id, data }) => facilitiesAPI.update(id, data),
    deleteFn: facilitiesAPI.delete,
    onCreateSuccess: () => setShowModal(false),
    onUpdateSuccess: () => {
      setShowModal(false);
      setEditingFacility(null);
    },
  });

  const updateStatusMutation = useMutation(
    ({ id, status }) => facilitiesAPI.updateStatus(id, status),
    {
      onSuccess: () => {
        toast.success('Estado de la instalación actualizado exitosamente');
        facilitiesResource.refetch();
      },
      onError: (error) => {
        console.error('Update Status Error:', error);
        toast.error(
          error.response?.data?.message || 'Error al actualizar estado',
        );
      },
    },
  );

  const facilities = useMemo(
    () => facilitiesResource.items ?? [],
    [facilitiesResource.items],
  );

  const filteredFacilities = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    return facilities.filter((facility) => {
      const name = (facility.name || '').toLowerCase();
      const description = (facility.description || '').toLowerCase();
      const status = (facility.status || '').toLowerCase();
      const matchesSearch =
        !search ||
        name.includes(search) ||
        description.includes(search);
      const matchesStatus =
        !statusFilter || status === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [facilities, searchTerm, statusFilter]);

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
      status: facility.status,
    });
    setShowModal(true);
  };

  const handleDelete = (facility) => {
    Swal.fire({
      title: '¿Está seguro?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        facilitiesResource.remove(facility.id);
      }
    });
  };

  const handleStatusChange = (facility, newStatus) => {
    updateStatusMutation.mutate({ id: facility.id, status: newStatus });
  };

  const handleSubmit = (formData) => {
    if (editingFacility) {
      facilitiesResource.update({ id: editingFacility.id, data: formData });
    } else {
      facilitiesResource.create(formData);
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Nombre',
      render: (facility) => facility.name,
    },
    {
      key: 'description',
      header: 'Descripción',
      render: (facility) => facility.description,
    },
    {
      key: 'capacity',
      header: 'Capacidad',
      render: (facility) => facility.capacity ?? 'N/A',
    },
    {
      key: 'status',
      header: 'Estado',
      render: (facility) => (
        <span className={`badge ${getStatusBadgeClass(facility.status)}`}>
          {facility.status || 'Desconocido'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Acciones',
      headerClassName: 'text-end',
      cellClassName: 'text-end',
      render: (facility) => (
        <div className="btn-group" role="group">
          <button
            type="button"
            className="btn btn-outline-primary btn-sm"
            onClick={() => handleEdit(facility)}
          >
            <i className="bi bi-pencil"></i>
          </button>
          <button
            type="button"
            className="btn btn-outline-danger btn-sm"
            onClick={() => handleDelete(facility)}
            disabled={facilitiesResource.mutations.delete.isLoading}
          >
            <i className="bi bi-trash"></i>
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
              {STATUS_OPTIONS.map((option) => (
                <li key={`${facility.id}-${option.value}`}>
                  <button
                    type="button"
                    className="dropdown-item"
                    onClick={() => handleStatusChange(facility, option.value)}
                  >
                    {option.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ),
    },
  ];

  return (
    <AdminPageLayout
      title="Gestión de Instalaciones"
      description="Administre las áreas comunes y espacios del conjunto residencial"
      actions={
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleCreate}
          disabled={facilitiesResource.mutations.create.isLoading}
        >
          <i className="bi bi-plus-lg"></i> Añadir Instalación
        </button>
      }
    >
      <ResourceToolbar
        search={{
          id: 'facility-search',
          label: 'Buscar',
          placeholder: 'Buscar instalaciones...',
          value: searchTerm,
          icon: 'bi-search',
          onChange: setSearchTerm,
        }}
        filters={[
          {
            id: 'facility-status',
            label: 'Estado',
            placeholder: 'Todos los estados',
            value: statusFilter,
            icon: 'bi-filter',
            onChange: setStatusFilter,
            allowClear: true,
            options: STATUS_OPTIONS,
          },
        ]}
      />

      {facilitiesResource.isError && (
        <div className="alert alert-danger" role="alert">
          Error al cargar las instalaciones: {facilitiesResource.error?.message}
        </div>
      )}

      <div className="card">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3 className="h5 mb-0">Lista de Instalaciones</h3>
            <span className="badge bg-primary">
              {filteredFacilities.length} instalaciones
            </span>
          </div>
          <DataTable
            columns={columns}
            data={filteredFacilities}
            isLoading={facilitiesResource.isLoading}
            loadingMessage="Cargando instalaciones..."
            emptyMessage={
              searchTerm || statusFilter
                ? 'No se encontraron instalaciones con esos criterios'
                : 'No hay instalaciones registradas'
            }
            rowKey={(facility) => facility.id}
          />
        </div>
      </div>

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
    </AdminPageLayout>
  );
};

export default Facilities;