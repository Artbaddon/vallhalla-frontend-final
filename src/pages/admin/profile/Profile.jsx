import React, { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import { AdminPageLayout } from '../../../components/common';
import { useAuth } from '../../../contexts/AuthContext';
import { usersAPI } from '../../../services/api';
import defaultAvatar from '../../../assets/images/default-avatar.jpg';
import './Profile.css';

const coalesceText = (...values) => {
  for (const value of values) {
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed) return trimmed;
    }
  }
  for (const value of values) {
    if (value != null && value !== '') return value;
  }
  return '';
};

const coalesceValue = (...values) => {
  for (const value of values) {
    if (value != null && value !== '') return value;
  }
  return null;
};

const formatMembershipDate = (value) => {
  if (!value) return 'No disponible';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'No disponible';
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const normalizeProfileData = (raw, fallbackUser = {}) => {
  const fallback = {
    id: fallbackUser?.userId ?? fallbackUser?.id ?? null,
    roleId: fallbackUser?.roleId ?? null,
    roleName: fallbackUser?.roleName ?? '',
    username: fallbackUser?.username ?? '',
    email: fallbackUser?.email ?? '',
    firstName: fallbackUser?.firstName ?? '',
    lastName: fallbackUser?.lastName ?? '',
    fullName: fallbackUser?.username ?? '',
    phone: fallbackUser?.phone ?? '',
    documentType: fallbackUser?.documentType ?? '',
    documentNumber: fallbackUser?.documentNumber ?? '',
    address: fallbackUser?.address ?? '',
    avatarUrl: fallbackUser?.avatarUrl ?? '',
    createdAt: fallbackUser?.createdAt ?? null,
    updatedAt: fallbackUser?.updatedAt ?? null,
  };

  if (!raw) {
    return fallback;
  }

  const candidates = [
    raw,
    raw?.data,
    raw?.user,
    raw?.profile,
    raw?.data?.user,
    raw?.data?.profile,
    Array.isArray(raw?.results) ? raw?.results[0] : undefined,
    Array.isArray(raw?.data?.results) ? raw?.data?.results[0] : undefined,
    Array.isArray(raw) ? raw[0] : undefined,
  ];

  const base = candidates.find((candidate) => candidate && !Array.isArray(candidate)) ?? fallback;

  const firstName = coalesceText(
    base.first_name,
    base.First_name,
    base.firstName,
    base.User_first_name,
    base.Person_first_name,
    fallback.firstName,
  );
  const lastName = coalesceText(
    base.last_name,
    base.Last_name,
    base.lastName,
    base.User_last_name,
    base.Person_last_name,
    fallback.lastName,
  );
  const fullName = coalesceText(
    base.full_name,
    base.Full_name,
    base.Profile_fullName,
    `${firstName} ${lastName}`,
    fallback.fullName,
  );

  return {
    id: coalesceValue(base.id, base.User_id, base.user_id, fallback.id),
    roleId: coalesceValue(base.role_id, base.Role_id, fallback.roleId),
    roleName: coalesceText(base.role_name, base.Role_name, base.role, fallback.roleName),
    username: coalesceText(base.username, base.User_username, base.Users_name, fallback.username),
    email: coalesceText(base.email, base.User_email, base.Users_email, fallback.email),
    firstName,
    lastName,
    fullName,
    phone: coalesceText(base.phone, base.phone_number, base.Phone_number, base.User_phone, fallback.phone),
    documentType: coalesceText(base.document_type, base.doc_type, base.Document_type, fallback.documentType),
    documentNumber: coalesceText(base.document_number, base.doc_number, base.Document_number, fallback.documentNumber),
    address: coalesceText(base.address, base.Address, base.User_address, fallback.address),
    avatarUrl: coalesceText(base.avatar_url, base.profile_picture, base.Profile_picture, fallback.avatarUrl),
    createdAt: coalesceValue(base.created_at, base.createdAt, base.User_createdAt, fallback.createdAt),
    updatedAt: coalesceValue(base.updated_at, base.updatedAt, base.User_updatedAt, fallback.updatedAt),
  };
};

const createProfileDefaultValues = (profile) => ({
  firstName: profile?.firstName ?? '',
  lastName: profile?.lastName ?? '',
  email: profile?.email ?? '',
  phone: profile?.phone ?? '',
  documentType: profile?.documentType ?? '',
  documentNumber: profile?.documentNumber ?? '',
  address: profile?.address ?? '',
});

const prepareFieldValue = (value) => {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  return value ?? null;
};

const assignWithAliases = (target, key, value, aliases = []) => {
  const prepared = prepareFieldValue(value);
  if (prepared === undefined) return;
  target[key] = prepared;
  aliases.forEach((alias) => {
    target[alias] = prepared;
  });
};

const buildUpdatePayload = (values, profile) => {
  const payload = {};

  assignWithAliases(payload, 'first_name', values.firstName, [
    'First_name',
    'firstName',
    'User_first_name',
    'Person_first_name',
  ]);
  assignWithAliases(payload, 'last_name', values.lastName, [
    'Last_name',
    'lastName',
    'User_last_name',
    'Person_last_name',
  ]);
  assignWithAliases(payload, 'email', values.email, [
    'Email',
    'user_email',
    'User_email',
  ]);
  assignWithAliases(payload, 'phone_number', values.phone, [
    'Phone_number',
    'phone',
    'User_phone',
  ]);
  assignWithAliases(payload, 'document_type', values.documentType, [
    'Document_type',
    'doc_type',
    'Doc_type',
  ]);
  assignWithAliases(payload, 'document_number', values.documentNumber, [
    'Document_number',
    'doc_number',
    'Doc_number',
  ]);
  assignWithAliases(payload, 'address', values.address, [
    'Address',
    'user_address',
    'User_address',
  ]);

  if (profile?.roleId != null) {
    assignWithAliases(payload, 'role_id', profile.roleId, ['Role_id', 'roleId']);
  }

  const profileId = profile?.id ?? null;
  if (profileId != null) {
    assignWithAliases(payload, 'user_id', profileId, ['User_id', 'id']);
  }

  return payload;
};

const Profile = () => {
  const { user, updateUser, changePassword } = useAuth();
  const userId = user?.userId ?? user?.id ?? null;
  const queryClient = useQueryClient();

  const {
    data: rawProfile,
    isLoading: isProfileLoading,
    error: profileError,
  } = useQuery(
    ['profile', userId],
    () => usersAPI.getDetailById(userId),
    {
      enabled: Boolean(userId),
      staleTime: 1000 * 60 * 5,
      onError: (error) => {
        console.error('Error al cargar el perfil', error);
        toast.error(error.response?.data?.message || 'No se pudo cargar la información del perfil');
      },
    },
  );

  const profile = useMemo(() => normalizeProfileData(rawProfile, user), [rawProfile, user]);
  const profileDefaults = useMemo(() => createProfileDefaultValues(profile), [profile]);

  const {
    register: profileRegister,
    handleSubmit: submitProfileForm,
    reset: resetProfileForm,
    formState: { errors: profileErrors, isDirty: profileIsDirty, isSubmitting: profileIsSubmitting },
  } = useForm({
    defaultValues: profileDefaults,
  });

  useEffect(() => {
    resetProfileForm(profileDefaults);
  }, [profileDefaults, resetProfileForm]);

  const updateProfileMutation = useMutation(
    (payload) => usersAPI.update(profile.id ?? userId, payload),
    {
      onSuccess: (_, variables) => {
        toast.success('Perfil actualizado correctamente');
        queryClient.invalidateQueries(['profile', userId]);
        const nextUsername = variables?.username || profile.username || user?.username;
        if (nextUsername) {
          updateUser({ username: nextUsername });
        }
      },
      onError: (error) => {
        console.error('Error al actualizar el perfil', error);
        toast.error(error.response?.data?.message || 'No se pudo actualizar el perfil');
      },
    },
  );

  const {
    register: passwordRegister,
    handleSubmit: submitPasswordForm,
    reset: resetPasswordForm,
    watch: watchPasswordFields,
    formState: { errors: passwordErrors, isSubmitting: passwordIsSubmitting },
  } = useForm({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmitProfile = async (values) => {
    if (!profile.id && !userId) {
      toast.error('No se pudo identificar al usuario.');
      return;
    }
    const payload = buildUpdatePayload(values, profile);
    await updateProfileMutation.mutateAsync(payload);
  };

  const onSubmitPassword = async (values) => {
    if (values.newPassword === values.currentPassword) {
      toast.error('La nueva contraseña debe ser diferente a la actual');
      return;
    }

    const result = await changePassword(values.currentPassword, values.newPassword);
    if (result?.success) {
      resetPasswordForm();
    }
  };

  const newPasswordValue = watchPasswordFields('newPassword');

  if (!userId) {
    return (
      <AdminPageLayout
        title="Mi Perfil"
        description="Administre su información personal"
      >
        <div className="alert alert-warning" role="alert">
          No se pudo obtener la información del usuario. Inicie sesión nuevamente.
        </div>
      </AdminPageLayout>
    );
  }

  if (isProfileLoading && !profile.fullName) {
    return (
      <AdminPageLayout
        title="Mi Perfil"
        description="Administre su información personal"
      >
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-border text-primary" role="status" aria-hidden="true"></div>
        </div>
      </AdminPageLayout>
    );
  }

  return (
    <AdminPageLayout
      title="Mi Perfil"
      description="Administre su información personal y credenciales"
    >
      {profileError && (
        <div className="alert alert-warning" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {profileError.response?.data?.message || 'Mostrando la información más reciente disponible.'}
        </div>
      )}

      <div className="profile-grid">
        <div className="card profile-card profile-summary-card">
          <div className="card-body">
            <div className="text-center">
              <div className="profile-avatar-wrapper mx-auto">
                <img
                  src={profile.avatarUrl || defaultAvatar}
                  alt={profile.fullName || profile.username || 'Avatar'}
                  className="profile-avatar"
                />
              </div>
              <h4 className="mb-1">{profile.fullName || profile.username || 'Usuario'}</h4>
              {profile.roleName && (
                <span className="badge rounded-pill text-bg-primary-soft mb-3">
                  <i className="bi bi-shield-lock me-1"></i>
                  {profile.roleName}
                </span>
              )}
            </div>

            <div className="profile-meta">
              <div className="profile-meta-item">
                <span className="profile-meta-label">Usuario</span>
                <span className="profile-meta-value">{profile.username || 'No disponible'}</span>
              </div>
              <div className="profile-meta-item">
                <span className="profile-meta-label">Correo electrónico</span>
                <span className="profile-meta-value">{profile.email || 'No disponible'}</span>
              </div>
              <div className="profile-meta-item">
                <span className="profile-meta-label">Teléfono</span>
                <span className="profile-meta-value">{profile.phone || 'No registrado'}</span>
              </div>
              <div className="profile-meta-item">
                <span className="profile-meta-label">Documento</span>
                <span className="profile-meta-value">
                  {profile.documentNumber
                    ? `${profile.documentType ? `${profile.documentType} · ` : ''}${profile.documentNumber}`
                    : 'No registrado'}
                </span>
              </div>
              <div className="profile-meta-item">
                <span className="profile-meta-label">Dirección</span>
                <span className="profile-meta-value">{profile.address || 'No registrada'}</span>
              </div>
              <div className="profile-meta-item">
                <span className="profile-meta-label">Miembro desde</span>
                <span className="profile-meta-value">{formatMembershipDate(profile.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card profile-card">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-start mb-4">
              <div>
                <h5 className="card-title mb-1">Información personal</h5>
                <p className="text-muted mb-0">
                  Actualice los datos asociados a su cuenta.
                </p>
              </div>
            </div>

            <form onSubmit={submitProfileForm(onSubmitProfile)}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label htmlFor="profile-first-name" className="form-label">
                    Nombres
                  </label>
                  <input
                    id="profile-first-name"
                    type="text"
                    className={`form-control${profileErrors.firstName ? ' is-invalid' : ''}`}
                    placeholder="Ingrese sus nombres"
                    {...profileRegister('firstName')}
                    disabled={updateProfileMutation.isLoading || profileIsSubmitting}
                  />
                  {profileErrors.firstName && (
                    <div className="invalid-feedback">{profileErrors.firstName.message}</div>
                  )}
                </div>

                <div className="col-md-6">
                  <label htmlFor="profile-last-name" className="form-label">
                    Apellidos
                  </label>
                  <input
                    id="profile-last-name"
                    type="text"
                    className={`form-control${profileErrors.lastName ? ' is-invalid' : ''}`}
                    placeholder="Ingrese sus apellidos"
                    {...profileRegister('lastName')}
                    disabled={updateProfileMutation.isLoading || profileIsSubmitting}
                  />
                  {profileErrors.lastName && (
                    <div className="invalid-feedback">{profileErrors.lastName.message}</div>
                  )}
                </div>

                <div className="col-md-6">
                  <label htmlFor="profile-email" className="form-label">
                    Correo electrónico
                  </label>
                  <input
                    id="profile-email"
                    type="email"
                    className={`form-control${profileErrors.email ? ' is-invalid' : ''}`}
                    placeholder="correo@correo.com"
                    {...profileRegister('email', {
                      pattern: {
                        value: /\S+@\S+\.\S+/,
                        message: 'Ingrese un correo electrónico válido',
                      },
                    })}
                    disabled={updateProfileMutation.isLoading || profileIsSubmitting}
                  />
                  {profileErrors.email && (
                    <div className="invalid-feedback">{profileErrors.email.message}</div>
                  )}
                </div>

                <div className="col-md-6">
                  <label htmlFor="profile-phone" className="form-label">
                    Teléfono de contacto
                  </label>
                  <input
                    id="profile-phone"
                    type="tel"
                    className={`form-control${profileErrors.phone ? ' is-invalid' : ''}`}
                    placeholder="Ingrese su número de contacto"
                    {...profileRegister('phone')}
                    disabled={updateProfileMutation.isLoading || profileIsSubmitting}
                  />
                  {profileErrors.phone && (
                    <div className="invalid-feedback">{profileErrors.phone.message}</div>
                  )}
                </div>

                <div className="col-md-6">
                  <label htmlFor="profile-document-type" className="form-label">
                    Tipo de documento
                  </label>
                  <input
                    id="profile-document-type"
                    type="text"
                    className={`form-control${profileErrors.documentType ? ' is-invalid' : ''}`}
                    placeholder="CC, CE, PAS, ..."
                    {...profileRegister('documentType')}
                    disabled={updateProfileMutation.isLoading || profileIsSubmitting}
                  />
                  {profileErrors.documentType && (
                    <div className="invalid-feedback">{profileErrors.documentType.message}</div>
                  )}
                </div>

                <div className="col-md-6">
                  <label htmlFor="profile-document-number" className="form-label">
                    Número de documento
                  </label>
                  <input
                    id="profile-document-number"
                    type="text"
                    className={`form-control${profileErrors.documentNumber ? ' is-invalid' : ''}`}
                    placeholder="Ingrese su documento"
                    {...profileRegister('documentNumber')}
                    disabled={updateProfileMutation.isLoading || profileIsSubmitting}
                  />
                  {profileErrors.documentNumber && (
                    <div className="invalid-feedback">{profileErrors.documentNumber.message}</div>
                  )}
                </div>

                <div className="col-12">
                  <label htmlFor="profile-address" className="form-label">
                    Dirección
                  </label>
                  <input
                    id="profile-address"
                    type="text"
                    className={`form-control${profileErrors.address ? ' is-invalid' : ''}`}
                    placeholder="Ingrese su dirección"
                    {...profileRegister('address')}
                    disabled={updateProfileMutation.isLoading || profileIsSubmitting}
                  />
                  {profileErrors.address && (
                    <div className="invalid-feedback">{profileErrors.address.message}</div>
                  )}
                </div>
              </div>

              <div className="profile-form-actions">
                <button
                  type="button"
                  className="btn btn-light"
                  onClick={() => resetProfileForm(profileDefaults)}
                  disabled={updateProfileMutation.isLoading || profileIsSubmitting || !profileIsDirty}
                >
                  Restablecer
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={
                    updateProfileMutation.isLoading ||
                    profileIsSubmitting ||
                    !profileIsDirty
                  }
                >
                  {updateProfileMutation.isLoading || profileIsSubmitting ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-floppy-fill me-2"></i>
                      Guardar cambios
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="card profile-card profile-password-card">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-start mb-4">
            <div>
              <h5 className="card-title mb-1">Seguridad y acceso</h5>
              <p className="text-muted mb-0">
                Actualice su contraseña periódicamente para mantener la cuenta protegida.
              </p>
            </div>
          </div>

          <form onSubmit={submitPasswordForm(onSubmitPassword)} className="profile-password-form">
            <div className="row g-3">
              <div className="col-md-4">
                <label htmlFor="profile-current-password" className="form-label">
                  Contraseña actual
                </label>
                <input
                  id="profile-current-password"
                  type="password"
                  className={`form-control${passwordErrors.currentPassword ? ' is-invalid' : ''}`}
                  placeholder="Ingrese su contraseña actual"
                  {...passwordRegister('currentPassword', {
                    required: 'La contraseña actual es obligatoria',
                  })}
                  disabled={passwordIsSubmitting}
                />
                {passwordErrors.currentPassword && (
                  <div className="invalid-feedback">{passwordErrors.currentPassword.message}</div>
                )}
              </div>

              <div className="col-md-4">
                <label htmlFor="profile-new-password" className="form-label">
                  Nueva contraseña
                </label>
                <input
                  id="profile-new-password"
                  type="password"
                  className={`form-control${passwordErrors.newPassword ? ' is-invalid' : ''}`}
                  placeholder="Mínimo 8 caracteres"
                  {...passwordRegister('newPassword', {
                    required: 'Ingrese una nueva contraseña',
                    minLength: {
                      value: 8,
                      message: 'La contraseña debe tener al menos 8 caracteres',
                    },
                  })}
                  disabled={passwordIsSubmitting}
                />
                {passwordErrors.newPassword && (
                  <div className="invalid-feedback">{passwordErrors.newPassword.message}</div>
                )}
              </div>

              <div className="col-md-4">
                <label htmlFor="profile-confirm-password" className="form-label">
                  Confirmar nueva contraseña
                </label>
                <input
                  id="profile-confirm-password"
                  type="password"
                  className={`form-control${passwordErrors.confirmPassword ? ' is-invalid' : ''}`}
                  placeholder="Repita la nueva contraseña"
                  {...passwordRegister('confirmPassword', {
                    required: 'Confirme la nueva contraseña',
                    validate: (value) =>
                      value === newPasswordValue || 'Las contraseñas no coinciden',
                  })}
                  disabled={passwordIsSubmitting}
                />
                {passwordErrors.confirmPassword && (
                  <div className="invalid-feedback">{passwordErrors.confirmPassword.message}</div>
                )}
              </div>
            </div>

            <div className="profile-form-actions justify-content-start">
              <button
                type="button"
                className="btn btn-light"
                onClick={() => resetPasswordForm()}
                disabled={passwordIsSubmitting}
              >
                Limpiar
              </button>
              <button
                type="submit"
                className="btn btn-outline-primary"
                disabled={passwordIsSubmitting}
              >
                {passwordIsSubmitting ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Actualizando...
                  </>
                ) : (
                  <>
                    <i className="bi bi-shield-lock-fill me-2"></i>
                    Cambiar contraseña
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminPageLayout>
  );
};

export default Profile;