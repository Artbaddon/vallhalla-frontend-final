import React from 'react';
import PropTypes from 'prop-types';
import { Navigate } from 'react-router-dom';
import useFeatureAccess from '../../hooks/useFeatureAccess';
import useNavigationConfig from '../../hooks/useNavigationConfig';

const FeatureGuard = ({ featureKey, children }) => {
  const { can } = useFeatureAccess(featureKey);
  const { defaultPath } = useNavigationConfig();

  if (!can.canView) {
    return <Navigate to={defaultPath ?? '/'} replace />;
  }

  return children;
};

FeatureGuard.propTypes = {
  featureKey: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

export default FeatureGuard;
