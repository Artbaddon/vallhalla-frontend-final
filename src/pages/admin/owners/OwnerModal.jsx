import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import Modal from 'react-modal';
import './OwnerModal.css';

// Set modal app element for accessibility
Modal.setAppElement('#root');

const baseFormValues = {
  username: '',
  password: '',
  user_status_id: '1',
  role_id: '2',
  is_tenant: false,
  birth_date: '',
  first_name: '',
  last_name: '',
  document_type: 'CC',
  document_number: '',
  phone: '',
  email: '',
  tower_id: '',
  apartment_id: '',
};

const OwnerModal = ({
  show,
  onHide,
  onSubmit,
  owner,
  isLoading,
  towers = [],
  apartments = [],
  referenceLoading = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isTenant, setIsTenant] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    watch,
  } = useForm({ defaultValues: baseFormValues });

  const selectedTowerValue = watch('tower_id');
  const selectedApartmentValue = watch('apartment_id');

  const filteredApartments = useMemo(() => {
    if (!selectedTowerValue) return apartments;
    return apartments.filter((apartment) => {
      if (!apartment) return false;
      if (!apartment.towerValue) return true;
      return apartment.towerValue === selectedTowerValue;
    });
  }, [apartments, selectedTowerValue]);

  useEffect(() => {
    setIsOpen(show);
  }, [show]);

  useEffect(() => {
    if (!show) {
      reset(baseFormValues);
      setIsTenant(false);
      return;
    }

    const normalizeDate = (value) => {
      if (!value) return '';
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) {
        return typeof value === 'string' && value.includes('T')
          ? value.split('T')[0]
          : '';
      }
      return date.toISOString().slice(0, 10);
    };

    const resolveTowerValue = () => {
      if (!owner) return '';
      if (owner.towerId != null) {
        const idString = String(owner.towerId);
        const towerById = towers.find(
          (tower) => tower.id != null && String(tower.id) === idString,
        );
        return towerById?.value ?? idString;
      }
      if (owner.tower) {
        const towerByName = towers.find(
          (tower) => tower.name?.toLowerCase() === owner.tower?.toLowerCase(),
        );
        return towerByName?.value ?? owner.tower;
      }
      return '';
    };

    const resolvedTowerValue = resolveTowerValue();

    const resolveApartmentValue = (towerValue) => {
      if (!owner) return '';
      if (owner.apartmentId != null) {
        const idString = String(owner.apartmentId);
        const apartmentById = apartments.find(
          (apartment) => apartment.id != null && String(apartment.id) === idString,
        );
        return apartmentById?.value ?? idString;
      }
      if (owner.apartment) {
        const apartmentByNumber = apartments.find((apartment) => {
          if (!apartment?.number) return false;
          const matchesNumber =
            apartment.number.toString().toLowerCase() ===
            owner.apartment.toString().toLowerCase();
          if (!matchesNumber) return false;
          if (!towerValue) return true;
          return !apartment.towerValue || apartment.towerValue === towerValue;
        });
        return apartmentByNumber?.value ?? '';
      }
      return '';
    };

    const tenantFlag = owner
      ? Boolean(
          owner.isTenant !== undefined
            ? owner.isTenant
            : owner.Owner_is_tenant === 1,
        )
      : false;

    reset({
      username: owner?.username ?? owner?.Users_name ?? '',
      password: '',
      user_status_id: String(
        owner?.userStatusId ?? owner?.user_status_id ?? 1,
      ),
      role_id: String(owner?.roleId ?? owner?.role_id ?? 2),
      is_tenant: tenantFlag,
      birth_date: normalizeDate(owner?.birthDate ?? owner?.Owner_birth_date),
      first_name:
        owner?.firstName ?? owner?.first_name ?? owner?.Owner_first_name ?? '',
      last_name:
        owner?.lastName ?? owner?.last_name ?? owner?.Owner_last_name ?? '',
      document_type:
        owner?.documentType ?? owner?.document_type ?? owner?.Owner_document_type ?? 'CC',
      document_number:
        owner?.documentNumber ?? owner?.document_number ?? owner?.Owner_document_number ?? '',
      phone:
        owner?.phone ?? owner?.Owner_phone ?? owner?.Profile_telephone_number ?? '',
      email:
        owner?.email ??
        owner?.Users_email ??
        owner?.Owner_email ??
        owner?.Profile_email ??
        '',
      tower_id: resolvedTowerValue,
      apartment_id: resolveApartmentValue(resolvedTowerValue),
    });

    setIsTenant(tenantFlag);
  }, [show, owner, towers, apartments, reset]);

  useEffect(() => {
    if (!selectedApartmentValue) return;
    const apartment = apartments.find((item) => item?.value === selectedApartmentValue);
    if (
      apartment &&
      apartment.towerValue &&
      apartment.towerValue !== selectedTowerValue
    ) {
      setValue('apartment_id', '');
    }
  }, [apartments, selectedApartmentValue, selectedTowerValue, setValue]);

  const handleClose = () => {
    setIsOpen(false);
    reset(baseFormValues);
    setIsTenant(false);
    onHide();
  };

  const onSubmitForm = (data) => {
    const selectedTower = towers.find((tower) => tower?.value === data.tower_id);
    const selectedApartment = apartments.find(
      (apartment) => apartment?.value === data.apartment_id,
    );

    const formattedData = {
      username: data.username,
      password: data.password,
      user_status_id: parseInt(data.user_status_id, 10) || 1,
      role_id: parseInt(data.role_id, 10) || 2,
      is_tenant: data.is_tenant ? 1 : 0,
      birth_date: data.birth_date,
      first_name: data.first_name,
      last_name: data.last_name,
      document_type: data.document_type,
      document_number: data.document_number,
      email: data.email,
      phone: data.phone,
      tower_id: selectedTower?.id ?? null,
      tower: selectedTower?.name ?? null,
      apartment_id: selectedApartment?.id ?? null,
      apartment: selectedApartment?.number ?? null,
      photo_url: null,
    };

    onSubmit(formattedData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleClose}
      className="owner-modal"
      overlayClassName="modal-overlay"
      contentLabel={owner ? 'Editar Propietario' : 'Nuevo Propietario'}
    >
      <div className="modal-header">
        <h5 className="modal-title">
          {owner ? 'Editar Propietario' : 'Nuevo Propietario'}
        </h5>
        <button
          type="button"
          className="btn-close"
          onClick={handleClose}
          aria-label="Close"
        ></button>
      </div>

      <form onSubmit={handleSubmit(onSubmitForm)}>
        <div className="modal-body">
          {referenceLoading && (
            <div className="alert alert-info py-2 px-3 mb-3">
              Cargando información de torres y apartamentos...
            </div>
          )}

          <h6 className="form-section-title">Información de Cuenta</h6>
          <div className="row">
            <div className="col-md-6">
              <div className="form-group">
                <label htmlFor="username" className="form-label">
                  Nombre de Usuario <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  id="username"
                  className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                  {...register('username', {
                    required: 'El nombre de usuario es requerido',
                    minLength: {
                      value: 3,
                      message: 'El nombre de usuario debe tener al menos 3 caracteres',
                    },
                  })}
                />
                {errors.username && (
                  <div className="invalid-feedback">{errors.username.message}</div>
                )}
              </div>
            </div>

            <div className="col-md-6">
              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  Contraseña {!owner && <span className="text-danger">*</span>}
                </label>
                <input
                  type="password"
                  id="password"
                  className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                  {...register('password', {
                    required: !owner ? 'La contraseña es requerida' : false,
                    minLength: {
                      value: 8,
                      message: 'La contraseña debe tener al menos 8 caracteres',
                    },
                  })}
                />
                {errors.password && (
                  <div className="invalid-feedback">{errors.password.message}</div>
                )}
                {owner && (
                  <small className="form-text text-muted">
                    Deje en blanco para mantener la contraseña actual
                  </small>
                )}
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
              <div className="form-group">
                <label htmlFor="user_status_id" className="form-label">
                  Estado de Usuario
                </label>
                <select
                  id="user_status_id"
                  className="form-select"
                  {...register('user_status_id')}
                >
                  <option value="1">Activo</option>
                  <option value="2">Inactivo</option>
                  <option value="3">Pendiente</option>
                </select>
              </div>
            </div>

            <div className="col-md-6">
              <div className="form-group">
                <label htmlFor="is_tenant" className="form-label d-block">
                  ¿Es inquilino?
                </label>
                <div className="form-check form-switch">
                  <input
                    type="checkbox"
                    id="is_tenant"
                    className="form-check-input"
                    {...register('is_tenant')}
                    onChange={(e) => {
                      setIsTenant(e.target.checked);
                      setValue('is_tenant', e.target.checked);
                    }}
                    checked={isTenant}
                  />
                  <label className="form-check-label" htmlFor="is_tenant">
                    {isTenant ? 'Sí' : 'No'}
                  </label>
                </div>
              </div>
            </div>
          </div>

          <h6 className="form-section-title mt-4">Información Personal</h6>
          <div className="row">
            <div className="col-md-6">
              <div className="form-group">
                <label htmlFor="first_name" className="form-label">
                  Nombre <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  id="first_name"
                  className={`form-control ${errors.first_name ? 'is-invalid' : ''}`}
                  {...register('first_name', {
                    required: 'El nombre es requerido',
                    minLength: {
                      value: 2,
                      message: 'El nombre debe tener al menos 2 caracteres',
                    },
                  })}
                />
                {errors.first_name && (
                  <div className="invalid-feedback">{errors.first_name.message}</div>
                )}
              </div>
            </div>

            <div className="col-md-6">
              <div className="form-group">
                <label htmlFor="last_name" className="form-label">
                  Apellido <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  id="last_name"
                  className={`form-control ${errors.last_name ? 'is-invalid' : ''}`}
                  {...register('last_name', {
                    required: 'El apellido es requerido',
                    minLength: {
                      value: 2,
                      message: 'El apellido debe tener al menos 2 caracteres',
                    },
                  })}
                />
                {errors.last_name && (
                  <div className="invalid-feedback">{errors.last_name.message}</div>
                )}
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email <span className="text-danger">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                  {...register('email', {
                    required: 'El email es requerido',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Email inválido',
                    },
                  })}
                />
                {errors.email && (
                  <div className="invalid-feedback">{errors.email.message}</div>
                )}
              </div>
            </div>

            <div className="col-md-6">
              <div className="form-group">
                <label htmlFor="phone" className="form-label">
                  Teléfono <span className="text-danger">*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                  {...register('phone', {
                    required: 'El teléfono es requerido',
                  })}
                />
                {errors.phone && (
                  <div className="invalid-feedback">{errors.phone.message}</div>
                )}
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-4">
              <div className="form-group">
                <label htmlFor="document_type" className="form-label">
                  Tipo de Documento <span className="text-danger">*</span>
                </label>
                <select
                  id="document_type"
                  className={`form-select ${errors.document_type ? 'is-invalid' : ''}`}
                  {...register('document_type', {
                    required: 'El tipo de documento es requerido',
                  })}
                >
                  <option value="">Seleccionar...</option>
                  <option value="CC">Cédula de Ciudadanía</option>
                  <option value="CE">Cédula de Extranjería</option>
                  <option value="TI">Tarjeta de Identidad</option>
                  <option value="PP">Pasaporte</option>
                </select>
                {errors.document_type && (
                  <div className="invalid-feedback">{errors.document_type.message}</div>
                )}
              </div>
            </div>

            <div className="col-md-8">
              <div className="form-group">
                <label htmlFor="document_number" className="form-label">
                  Número de Documento <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  id="document_number"
                  className={`form-control ${errors.document_number ? 'is-invalid' : ''}`}
                  {...register('document_number', {
                    required: 'El número de documento es requerido',
                  })}
                />
                {errors.document_number && (
                  <div className="invalid-feedback">{errors.document_number.message}</div>
                )}
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-4">
              <div className="form-group">
                <label htmlFor="birth_date" className="form-label">
                  Fecha de Nacimiento <span className="text-danger">*</span>
                </label>
                <input
                  type="date"
                  id="birth_date"
                  className={`form-control ${errors.birth_date ? 'is-invalid' : ''}`}
                  {...register('birth_date', {
                    required: 'La fecha de nacimiento es requerida',
                  })}
                />
                {errors.birth_date && (
                  <div className="invalid-feedback">{errors.birth_date.message}</div>
                )}
              </div>
            </div>

            <div className="col-md-4">
              <div className="form-group">
                <label htmlFor="tower_id" className="form-label">
                  Torre
                </label>
                <select
                  id="tower_id"
                  className="form-select"
                  disabled={referenceLoading || !towers.length}
                  {...register('tower_id')}
                >
                  <option value="">Seleccione una torre</option>
                  {towers.map((tower) => (
                    <option key={tower.value} value={tower.value}>
                      {tower.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="col-md-4">
              <div className="form-group">
                <label htmlFor="apartment_id" className="form-label">
                  Apartamento
                </label>
                <select
                  id="apartment_id"
                  className="form-select"
                  disabled={
                    referenceLoading ||
                    (!!towers.length && !selectedTowerValue)
                  }
                  {...register('apartment_id')}
                >
                  <option value="">Seleccione un apartamento</option>
                  {filteredApartments.map((apartment) => (
                    <option key={apartment.value} value={apartment.value}>
                      {apartment.number}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleClose}
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
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                Guardando...
              </>
            ) : owner ? (
              'Actualizar'
            ) : (
              'Guardar'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default OwnerModal;