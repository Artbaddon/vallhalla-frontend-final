import React from 'react';
import PropTypes from 'prop-types';
import './AdminPageLayout.css';

const AdminPageLayout = ({
  title,
  description,
  actions,
  headerExtras,
  children,
}) => {
  return (
    <div className="admin-page-layout">
      <div className="page-header">
        <div>
          <h1 className="h3 mb-1">{title}</h1>
          {description && <p className="text-muted mb-0">{description}</p>}
        </div>
        {actions && <div className="page-header__actions">{actions}</div>}
      </div>

      {headerExtras && <div className="page-header__extras mb-4">{headerExtras}</div>}

      <div className="page-content">{children}</div>
    </div>
  );
};

AdminPageLayout.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  actions: PropTypes.node,
  headerExtras: PropTypes.node,
  children: PropTypes.node,
};

export default AdminPageLayout;
