import { useMemo } from 'react';
import { FEATURE_ROUTES, ROLE_IDS, ROLE_NAMES } from '../constants/navigationConfig';
import { useAuth } from '../contexts/AuthContext';

const defaultPermissions = Object.freeze({
  canView: false,
  canCreate: false,
  canEdit: false,
  canDelete: false,
});

const lookupFeature = (featureKey) =>
  FEATURE_ROUTES.find((feature) => feature.key === featureKey);

const mergePermissions = (permissions) => ({
  ...defaultPermissions,
  ...(permissions ?? {}),
});

const useFeatureAccess = (featureKey) => {
  const { user } = useAuth();
  const roleId = user?.roleId ?? null;

  return useMemo(() => {
    const feature = lookupFeature(featureKey);
    const permissions = feature?.permissions?.[roleId];

    const resolvedPermissions = mergePermissions(permissions);

    return {
      feature,
      roleId,
      roleKey:
        roleId === ROLE_IDS.ADMIN
          ? 'ADMIN'
          : roleId === ROLE_IDS.SECURITY
          ? 'SECURITY'
          : roleId === ROLE_IDS.OWNER
          ? 'OWNER'
          : null,
      roleName: ROLE_NAMES[roleId] ?? null,
      permissions: resolvedPermissions,
      can: resolvedPermissions,
    };
  }, [featureKey, roleId]);
};

export default useFeatureAccess;
