import React, { useMemo, useState } from 'react';
import {
  apartmentsAPI,
  towersAPI,
  apartmentStatusAPI,
  ownersAPI,
} from '../../../services/apiService';
import {
  AdminPageLayout,
  ResourceToolbar,
  DataTable,
  DynamicModal,
} from '../../../components/common';
import useCrudResource from '../../../hooks/useCrudResource';
import useArrayQuery from '../../../hooks/useArrayQuery';
import './Apartments.css';

const getStatusBadgeColor = (statusName) => {
  if (!statusName) return 'secondary';
  switch (statusName.toLowerCase()) {
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

const normalizeStatusOptions = (items = []) => {
  const array = Array.isArray(items) ? items : [];
  const seen = new Set();
  const normalized = [];

  array.forEach((status, index) => {
    const id =
      status?.id ??
      status?.status_id ??
      status?.Apartment_status_id ??
      status?.Apartment_status_FK_ID ??
      null;
    const baseName =
      status?.name ??
      status?.status_name ??
      status?.Apartment_status_name ??
      status?.Status_name ??
      '';
    const name =
      baseName || (id != null ? `Estado ${id}` : `Estado ${index + 1}`);
    const value = id != null ? String(id) : name;
    const dedupeKey = value || name || String(index);

    if (seen.has(dedupeKey)) {
      return;
    }

    seen.add(dedupeKey);
    normalized.push({ id, name, value });
  });

  return normalized;
};

const Apartments = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTower, setFilterTower] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    type: null,
    data: null,
  });

  const handleCloseModal = () =>
    setModalConfig({ isOpen: false, type: null, data: null });

  const apartmentsResource = useCrudResource({
    queryKey: 'apartments',
    fetcher: apartmentsAPI.getAll,
    select: (response) => response?.apartments ?? [],
    resourceLabel: { singular: 'apartamento', plural: 'apartamentos' },
    createFn: apartmentsAPI.create,
    updateFn: ({ id, data }) => apartmentsAPI.update(id, data),
    deleteFn: apartmentsAPI.delete,
    onCreateSuccess: handleCloseModal,
    onUpdateSuccess: handleCloseModal,
  });

  const towersQuery = useArrayQuery({
    queryKey: ['apartments', 'towers'],
    queryFn: towersAPI.getAll,
    dataKey: 'data',
    fallbackKeys: ['towers'],
    resourceLabel: { plural: 'torres' },
    transform: (items) =>
      items.map((tower, index) => {
        const id =
          tower?.Tower_id ?? tower?.id ?? tower?.tower_id ?? null;
        const baseName =
          tower?.Tower_name ?? tower?.name ?? tower?.tower_name ?? '';
        const name = baseName || (id != null ? `Torre ${id}` : `Torre ${index + 1}`);
        const value = id != null ? String(id) : name;
        return { id, name, value };
      }),
  });

  const statusesQuery = useArrayQuery({
    queryKey: ['apartments', 'statuses'],
    queryFn: apartmentStatusAPI.getAll,
    resourceLabel: { plural: 'estados de apartamento' },
    select: (response) => {
      const candidates = [
        response,
        response?.data,
        response?.statuses,
        response?.status,
        response?.apartmentStatuses,
        response?.apartment_statuses,
        response?.results,
        response?.records,
        response?.data?.data,
        response?.data?.statuses,
        response?.data?.status,
        response?.data?.apartmentStatuses,
        response?.data?.apartment_statuses,
        response?.data?.results,
        response?.data?.records,
      ];

      for (const candidate of candidates) {
        if (Array.isArray(candidate)) {
          return normalizeStatusOptions(candidate);
        }
      }

      if (response && typeof response === 'object') {
        const nestedArray = Object.values(response).find((value) =>
          Array.isArray(value),
        );
        if (Array.isArray(nestedArray)) {
          return normalizeStatusOptions(nestedArray);
        }
      }

      if (response?.data && typeof response.data === 'object') {
        const nestedArray = Object.values(response.data).find((value) =>
          Array.isArray(value),
        );
        if (Array.isArray(nestedArray)) {
          return normalizeStatusOptions(nestedArray);
        }
      }

      console.warn('apartments: no apartment statuses found in response', response);
      return [];
    },
  });

  const ownersQuery = useArrayQuery({
    queryKey: ['apartments', 'owners'],
    queryFn: ownersAPI.getDetails,
    dataKey: 'owners',
    fallbackKeys: ['data'],
    resourceLabel: { plural: 'propietarios' },
    transform: (items) =>
      items.map((owner, index) => {
        const id = owner?.Owner_id ?? owner?.id ?? owner?.owner_id ?? null;
        const rawFirst = owner?.Owner_first_name ?? owner?.first_name ?? '';
        const rawLast = owner?.Owner_last_name ?? owner?.last_name ?? '';
        const normalizedFullName = (owner?.Profile_fullName ?? owner?.fullName ?? '')
          .toString()
          .trim();

        let derivedFirst = '';
        let derivedLast = '';
        if (normalizedFullName) {
          const parts = normalizedFullName.split(/\s+/);
          derivedFirst = parts.shift() || '';
          derivedLast = parts.join(' ');
        }

        const firstName = (rawFirst || derivedFirst).trim();
        const lastName = (rawLast || derivedLast).trim();
        const fullName =
          normalizedFullName || [firstName, lastName].filter(Boolean).join(' ');

        const fallbackName =
          owner?.Users_name ?? owner?.username ?? owner?.name ?? '';
        const email = owner?.Users_email ?? owner?.Owner_email ?? owner?.email ?? '';

        const name = fullName || fallbackName || email || `Propietario ${id ?? index + 1}`;
        const value = id != null ? String(id) : name;

        return {
          id,
          name,
          value,
          firstName,
          lastName,
          fullName,
        };
      }),
  });

  const apartments = useMemo(
    () => apartmentsResource.items ?? [],
    [apartmentsResource.items],
  );
  const towers = towersQuery.items ?? [];
  const statuses = statusesQuery.items ?? [];
  const owners = ownersQuery.items ?? [];

  const isLoading =
    apartmentsResource.isLoading ||
    towersQuery.isLoading ||
    statusesQuery.isLoading ||
    ownersQuery.isLoading;

  const filteredApartments = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    return apartments.filter((apartment) => {
      const matchesSearch =
        !search ||
        (apartment.Apartment_number || '')
          .toString()
          .toLowerCase()
          .includes(search);
      const matchesTower =
        !filterTower || String(apartment.Tower_FK_ID) === filterTower;
      const matchesStatus =
        !filterStatus || String(apartment.Apartment_status_FK_ID) === filterStatus;
      return matchesSearch && matchesTower && matchesStatus;
    });
  }, [apartments, filterStatus, filterTower, searchTerm]);

  const handleCreate = () =>
    setModalConfig({ isOpen: true, type: 'create', data: null });

  const handleView = (apartment) =>
    setModalConfig({ isOpen: true, type: 'view', data: apartment });

  const handleEdit = (apartment) =>
    setModalConfig({ isOpen: true, type: 'edit', data: apartment });

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de que desea eliminar este apartamento?')) {
      await apartmentsResource.remove(id);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const normalizeNumericField = (value) => {
      const trimmed = (value ?? '').toString().trim();
      if (!trimmed) return null;
      const parsed = Number(trimmed);
      return Number.isNaN(parsed) ? null : parsed;
    };
    const assignWithAliases = (target, key, value, aliases = []) => {
      if (value == null || (typeof value === 'string' && value.trim() === '')) {
        target[key] = null;
        return;
      }

      target[key] = value;
      aliases.forEach((alias) => {
        target[alias] = value;
      });
    };

    const rawApartmentNumber = (formData.get('apartment_number') ?? '').toString().trim();
    const apartmentNumber = (() => {
      if (!rawApartmentNumber) return '';
      const numeric = Number(rawApartmentNumber);
      return Number.isNaN(numeric) ? rawApartmentNumber : numeric;
    })();

    const towerId = normalizeNumericField(formData.get('tower_id'));
    const statusId = normalizeNumericField(formData.get('status_id'));
    const ownerId = normalizeNumericField(formData.get('owner_id'));

    const payload = {};

    assignWithAliases(payload, 'apartment_number', apartmentNumber, [
      'Apartment_number',
      'apartmentNumber',
    ]);
    assignWithAliases(payload, 'tower_id', towerId, [
      'Tower_FK_ID',
      'tower_fk_id',
      'towerId',
      'towerFkId',
    ]);
    assignWithAliases(payload, 'status_id', statusId, [
      'Apartment_status_id',
      'Apartment_status_FK_ID',
      'apartment_status_id',
      'apartment_status_fk_id',
      'status_fk_id',
      'statusId',
    ]);
    assignWithAliases(payload, 'owner_id', ownerId, [
      'Owner_FK_ID',
      'owner_fk_id',
      'ownerId',
    ]);

    if (import.meta.env.DEV) {
      // Helps diagnose unexpected payload transformations during development.
      console.debug('Apartments: submitting payload', payload);
    }

    try {
      if (modalConfig.type === 'edit') {
        await apartmentsResource.update({
          id: modalConfig.data?.Apartment_id,
          data: payload,
        });
      } else {
        await apartmentsResource.create(payload);
      }
    } catch (error) {
      const apiMessage = error?.response?.data || error?.message;
      console.error('Error al guardar apartamento', error, apiMessage);
    }
  };

  const renderModalContent = () => {
    const { type, data } = modalConfig;

    if (type === 'view') {
      return (
        <div className="apartment-details">
          <div className="mb-3">
            <label className="form-label fw-bold">Número:</label>
            <p>{data?.Apartment_number ?? 'N/A'}</p>
          </div>
          <div className="mb-3">
            <label className="form-label fw-bold">Torre:</label>
            <p>{data?.Tower_name ?? 'N/A'}</p>
          </div>
          <div className="mb-3">
            <label className="form-label fw-bold">Estado:</label>
            <p>
              <span
                className={`badge bg-${getStatusBadgeColor(
                  data?.Apartment_status_name,
                )}`}
              >
                {data?.Apartment_status_name ?? 'N/A'}
              </span>
            </p>
          </div>
          <div className="mb-0">
            <label className="form-label fw-bold">Propietario:</label>
            <p>{data?.owner_name ?? 'N/A'}</p>
          </div>
        </div>
      );
    }

    return (
      <>
        <div className="mb-3">
          <label htmlFor="apartment_number" className="form-label">
            Número de Apartamento
          </label>
          <input
            id="apartment_number"
            name="apartment_number"
            type="text"
            className="form-control"
            defaultValue={modalConfig.data?.Apartment_number ?? ''}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="tower_id" className="form-label">
            Torre
          </label>
          <select
            id="tower_id"
            name="tower_id"
            className="form-select"
            defaultValue={
              modalConfig.data?.Tower_FK_ID != null
                ? String(modalConfig.data.Tower_FK_ID)
                : ''
            }
            disabled={towersQuery.isLoading && !towers.length}
          >
            <option value="">Seleccione una torre</option>
            {towers.map((tower) => (
              <option
                key={`tower-${tower.id ?? tower.value ?? tower.name}`}
                value={tower.value}
              >
                {tower.name}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-3">
          <label htmlFor="status_id" className="form-label">
            Estado
          </label>
          <select
            id="status_id"
            name="status_id"
            className="form-select"
            defaultValue={
              modalConfig.data?.Apartment_status_FK_ID != null
                ? String(modalConfig.data.Apartment_status_FK_ID)
                : ''
            }
            disabled={statusesQuery.isLoading && !statuses.length}
          >
            <option value="">Seleccione un estado</option>
            {statuses.map((status) => (
              <option
                key={`status-${status.id ?? status.value ?? status.name}`}
                value={status.value}
              >
                {status.name}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-0">
          <label htmlFor="owner_id" className="form-label">
            Propietario
          </label>
          <select
            id="owner_id"
            name="owner_id"
            className="form-select"
            defaultValue={
              modalConfig.data?.Owner_FK_ID != null
                ? String(modalConfig.data.Owner_FK_ID)
                : ''
            }
            disabled={ownersQuery.isLoading && !owners.length}
          >
            <option value="">Seleccione un propietario</option>
            {owners.map((owner) => (
              <option
                key={`owner-${owner.id ?? owner.value ?? owner.name}`}
                value={owner.value}
              >
                {owner.name}
              </option>
            ))}
          </select>
        </div>
      </>
    );
  };

  const columns = [
    {
      key: 'Apartment_number',
      header: 'Número',
      render: (apartment) => apartment.Apartment_number ?? 'N/A',
    },
    {
      key: 'Tower_name',
      header: 'Torre',
      render: (apartment) => apartment.Tower_name ?? 'N/A',
    },
    {
      key: 'Apartment_status_name',
      header: 'Estado',
      render: (apartment) => (
        <span
          className={`badge bg-${getStatusBadgeColor(
            apartment.Apartment_status_name,
          )}`}
        >
          {apartment.Apartment_status_name ?? 'N/A'}
        </span>
      ),
    },
    {
      key: 'owner_name',
      header: 'Propietario',
      render: (apartment) => apartment.owner_name ?? 'N/A',
    },
    {
      key: 'actions',
      header: 'Acciones',
      headerClassName: 'text-end',
      cellClassName: 'text-end',
      render: (apartment) => (
        <div className="btn-group btn-group-sm" role="group">
          <button
            type="button"
            className="btn btn-outline-primary"
            onClick={() => handleView(apartment)}
            title="Ver detalles"
          >
            <i className="bi bi-eye"></i>
          </button>
          <button
            type="button"
            className="btn btn-outline-info"
            onClick={() => handleEdit(apartment)}
            title="Editar"
          >
            <i className="bi bi-pencil"></i>
          </button>
          <button
            type="button"
            className="btn btn-outline-danger"
            onClick={() => handleDelete(apartment.Apartment_id)}
            disabled={apartmentsResource.mutations.delete.isLoading}
            title="Eliminar"
          >
            <i className="bi bi-trash"></i>
          </button>
        </div>
      ),
    },
  ];

  const modalType = modalConfig.type;
  const modalTitle =
    modalType === 'view'
      ? 'Detalles del Apartamento'
      : modalType === 'edit'
      ? 'Editar Apartamento'
      : 'Nuevo Apartamento';
  const modalSubmitText =
    modalType === 'edit' ? 'Actualizar' : 'Crear';
  const isSubmitting =
    modalType === 'edit'
      ? apartmentsResource.mutations.update.isLoading
      : apartmentsResource.mutations.create.isLoading;

  return (
    <AdminPageLayout
      title="Gestión de Apartamentos"
      description="Administre los apartamentos del conjunto residencial"
      actions={
        <button
          type="button"
          className="btn btn-outline-primary"
          onClick={handleCreate}
          disabled={apartmentsResource.mutations.create.isLoading}
        >
          <i className="bi bi-plus-circle me-1"></i>
          Nuevo Apartamento
        </button>
      }
    >
      <ResourceToolbar
        search={{
          id: 'apartment-search',
          label: 'Buscar',
          placeholder: 'Buscar por número...',
          value: searchTerm,
          icon: 'bi-search',
          onChange: setSearchTerm,
        }}
        filters={[
          {
            id: 'tower-filter',
            label: 'Filtrar por Torre',
            value: filterTower,
            placeholder: 'Todas las torres',
            icon: 'bi-building',

            onChange: setFilterTower,
            allowClear: true,
            options: towers.map((tower) => ({
              value: tower.id != null ? String(tower.id) : tower.value,
              label: tower.name,
            })),
          },
          {
            id: 'status-filter',
            label: 'Filtrar por Estado',
            value: filterStatus,
            placeholder: 'Todos los estados',
            icon: 'bi-funnel',
            onChange: setFilterStatus,
            allowClear: true,
            options: statuses.map((status) => ({
              value: status.id != null ? String(status.id) : status.value,
              label: status.name,
            })),
          },
        ]}
      />

      {apartmentsResource.isError && (
        <div className="alert alert-danger" role="alert">
          Error al cargar los apartamentos: {apartmentsResource.error?.message}
        </div>
      )}

      <div className="card">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3 className="h5 mb-0">Lista de Apartamentos</h3>
            <span className="badge bg-primary">
              {filteredApartments.length} apartamentos
            </span>
          </div>
          <DataTable
            columns={columns}
            data={filteredApartments}
            isLoading={isLoading}
            loadingMessage="Cargando apartamentos..."
            emptyMessage={
              searchTerm || filterTower || filterStatus
                ? 'No se encontraron apartamentos con esos criterios'
                : 'No hay apartamentos registrados'
            }
            rowKey={(item, index) => item?.Apartment_id ?? index}
          />
        </div>
      </div>

      <DynamicModal
        isOpen={modalConfig.isOpen}
        onClose={handleCloseModal}
        title={modalTitle}
        onSubmit={modalType === 'view' ? undefined : handleSubmit}
        submitText={isSubmitting ? 'Guardando...' : modalSubmitText}
        size="lg"
        showFooter={modalType !== 'view'}
        isSubmitting={isSubmitting}
      >
        {renderModalContent()}
      </DynamicModal>
    </AdminPageLayout>
  );
};

export default Apartments;