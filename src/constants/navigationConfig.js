import DashboardHome from '../pages/admin/DashboardHome';
import Owners from '../pages/admin/owners/Owners';
import Guards from '../pages/admin/guard/Guards';
import Apartments from '../pages/admin/apartments/Apartments';
import Towers from '../pages/admin/towers/Towers';
import Tenants from '../pages/admin/tenant/Tenants';
import Payments from '../pages/admin/payments/Payments';
import Parking from '../pages/admin/parking/Parking';
import Pets from '../pages/admin/pets/Pets';
import PQRS from '../pages/admin/pqrs/PQRS';
import Reservations from '../pages/admin/reservations/Reservations';
import Surveys from '../pages/admin/surveys/Surveys';
import Profile from '../pages/admin/profile/Profile';
import GuardsVisitors from '../pages/admin/visitors/Visitors';
import Facilities from '../pages/admin/facilities/Facilities';
import Notifications from '../pages/admin/notifications/Notifications';
import Roles from '../pages/admin/roles/Roles';
import Permissions from '../pages/admin/permissions/Permissions';

export const ROLE_IDS = Object.freeze({
  ADMIN: 1,
  OWNER: 2,
  SECURITY: 3,
});

export const ROLE_NAMES = Object.freeze({
  [ROLE_IDS.ADMIN]: 'Administrador',
  [ROLE_IDS.OWNER]: 'Propietario',
  [ROLE_IDS.SECURITY]: 'Seguridad',
});

const viewOnly = {
  canView: true,
  canCreate: false,
  canEdit: false,
  canDelete: false,
};

const manageAll = {
  canView: true,
  canCreate: true,
  canEdit: true,
  canDelete: true,
};

export const FEATURE_ROUTES = [
  {
    key: 'dashboard',
    label: 'Panel de Control',
    path: 'dashboard',
    icon: 'bi-speedometer2',
    component: DashboardHome,
    group: 'General',
    showInDashboard: false,
    order: 0,
    permissions: {
      [ROLE_IDS.ADMIN]: { ...viewOnly },
      [ROLE_IDS.OWNER]: { ...viewOnly },
    },
  },
  {
    key: 'notifications',
    label: 'Notificaciones',
    path: 'notifications',
    icon: 'bi-bell',
    component: Notifications,
    group: 'General',
    showInDashboard: true,
    quickAccess: true,
    order: 1,
    permissions: {
      [ROLE_IDS.ADMIN]: { ...manageAll },
      [ROLE_IDS.OWNER]: { ...viewOnly },
    },
  },
  {
    key: 'profile',
    label: 'Perfil',
    path: 'profile',
    icon: 'bi-person-circle',
    component: Profile,
    group: 'General',
    showInDashboard: true,
    order: 2,
    permissions: {
      [ROLE_IDS.ADMIN]: { ...manageAll },
      [ROLE_IDS.OWNER]: { ...viewOnly, canEdit: true },
      [ROLE_IDS.SECURITY]: { ...viewOnly, canEdit: true },
    },
  },
  {
    key: 'owners',
    label: 'Propietarios',
    path: 'owners',
    icon: 'bi-person-fill',
    component: Owners,
    group: 'Gestión',
    showInDashboard: true,
    order: 10,
    permissions: {
      [ROLE_IDS.ADMIN]: { ...manageAll },
    },
  },
  {
    key: 'guards',
    label: 'Vigilantes',
    path: 'guards',
    icon: 'bi-shield-fill',
    component: Guards,
    group: 'Gestión',
    showInDashboard: true,
    order: 11,
    permissions: {
      [ROLE_IDS.ADMIN]: { ...manageAll },
    },
  },
  {
    key: 'apartments',
    label: 'Apartamentos',
    path: 'apartments',
    icon: 'bi-house-door',
    component: Apartments,
    group: 'Gestión',
    showInDashboard: true,
    order: 12,
    permissions: {
      [ROLE_IDS.ADMIN]: { ...manageAll },
    },
  },
  {
    key: 'towers',
    label: 'Torres',
    path: 'towers',
    icon: 'bi-building',
    component: Towers,
    group: 'Gestión',
    showInDashboard: false,
    order: 13,
    permissions: {
      [ROLE_IDS.ADMIN]: { ...manageAll },
    },
  },
  {
    key: 'reservations',
    label: 'Reservas',
    path: 'reservations',
    icon: 'bi-calendar-event',
    component: Reservations,
    group: 'Operaciones',
    showInDashboard: true,
    quickAccess: true,
    order: 30,
    permissions: {
      [ROLE_IDS.ADMIN]: { ...manageAll },
      [ROLE_IDS.OWNER]: { ...manageAll },
    },
  },
  {
    key: 'surveys',
    label: 'Encuestas',
    path: 'surveys',
    icon: 'bi-clipboard-data',
    component: Surveys,
    group: 'Operaciones',
    showInDashboard: true,
    order: 31,
    permissions: {
      [ROLE_IDS.ADMIN]: { ...manageAll },
      [ROLE_IDS.OWNER]: { ...manageAll },
    },
  },
  {
    key: 'payments',
    label: 'Pagos',
    path: 'payments',
    icon: 'bi-cash',
    component: Payments,
    group: 'Operaciones',
    showInDashboard: true,
    quickAccess: true,
    order: 32,
    permissions: {
      [ROLE_IDS.ADMIN]: { ...manageAll },
      [ROLE_IDS.OWNER]: { ...manageAll },
    },
  },
  {
    key: 'pqrs',
    label: 'PQRS',
    path: 'pqrs',
    icon: 'bi-question-circle',
    component: PQRS,
    group: 'Operaciones',
    showInDashboard: true,
    order: 33,
    permissions: {
      [ROLE_IDS.ADMIN]: { ...manageAll },
      [ROLE_IDS.OWNER]: { ...manageAll },
    },
  },
  {
    key: 'parking',
    label: 'Parqueaderos',
    path: 'parking',
    icon: 'bi-p-circle',
    component: Parking,
    group: 'Operaciones',
    showInDashboard: true,
    order: 34,
    permissions: {
      [ROLE_IDS.ADMIN]: { ...manageAll },
      [ROLE_IDS.OWNER]: { ...viewOnly },
      [ROLE_IDS.SECURITY]: { ...viewOnly },
    },
  },
  {
    key: 'pets',
    label: 'Mascotas',
    path: 'pets',
    icon: 'bi-heart',
    component: Pets,
    group: 'Operaciones',
    showInDashboard: true,
    quickAccess: true,
    order: 35,
    permissions: {
      [ROLE_IDS.ADMIN]: { ...manageAll },
      [ROLE_IDS.OWNER]: { ...manageAll },
    },
  },
  {
    key: 'visitors',
    label: 'Visitantes',
    path: 'visitors',
    icon: 'bi-door-open',
    component: GuardsVisitors,
    group: 'Seguridad',
    showInDashboard: true,
    quickAccess: true,
    order: 9,
    permissions: {
      [ROLE_IDS.ADMIN]: { ...manageAll },
      [ROLE_IDS.SECURITY]: { ...manageAll },
    },
  },
];

export const DEFAULT_FEATURE_KEY = 'dashboard';

export const getDefaultPathForRole = (roleId) => {
  const defaultFeature = FEATURE_ROUTES.find((feature) => {
    const permissions = feature.permissions?.[roleId];
    return permissions?.canView;
  });

  if (!defaultFeature) {
    return '/';
  }

  return `/app/${defaultFeature.path}`;
};
