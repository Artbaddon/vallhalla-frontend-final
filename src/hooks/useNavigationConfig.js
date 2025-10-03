import { useMemo } from 'react';
import {
  FEATURE_ROUTES,
  getDefaultPathForRole,
  ROLE_IDS,
  ROLE_NAMES,
} from '../constants/navigationConfig';
import { useAuth } from '../contexts/AuthContext';

const buildSidebarItems = (features) => {
  return features
    .filter((feature) => feature.path && feature.label)
    .map((feature) => ({
      type: 'link',
      key: feature.key,
      label: feature.label,
      icon: feature.icon,
      path: `/app/${feature.path}`,
    }));
};

const useNavigationConfig = () => {
  const { user } = useAuth();
  const roleId = user?.roleId ?? null;

  const accessibleFeatures = useMemo(() => {
    if (!roleId) return [];
    return FEATURE_ROUTES.filter((feature) => feature.permissions?.[roleId]?.canView);
  }, [roleId]);

  const sidebarItems = useMemo(
    () => buildSidebarItems(accessibleFeatures),
    [accessibleFeatures]
  );

  const dashboardCards = useMemo(
    () =>
      accessibleFeatures
        .filter((feature) => feature.showInDashboard)
        .sort((a, b) => {
          const aOrder = a.order ?? Number.MAX_SAFE_INTEGER;
          const bOrder = b.order ?? Number.MAX_SAFE_INTEGER;
          return aOrder - bOrder;
        }),
    [accessibleFeatures]
  );

  const quickAccess = useMemo(
    () =>
      accessibleFeatures
        .filter((feature) => feature.quickAccess)
        .sort((a, b) => {
          const aOrder = a.order ?? Number.MAX_SAFE_INTEGER;
          const bOrder = b.order ?? Number.MAX_SAFE_INTEGER;
          return aOrder - bOrder;
        }),
    [accessibleFeatures]
  );

  return {
    roleId,
    roleName: ROLE_NAMES[roleId] ?? user?.roleName ?? null,
    roleKey:
      roleId === ROLE_IDS.ADMIN
        ? 'ADMIN'
        : roleId === ROLE_IDS.SECURITY
        ? 'SECURITY'
        : roleId === ROLE_IDS.OWNER
        ? 'OWNER'
        : null,
    accessibleFeatures,
    sidebarItems,
    dashboardCards,
    quickAccess,
    defaultPath: getDefaultPathForRole(roleId),
  };
};

export default useNavigationConfig;
