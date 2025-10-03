import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import './Topbar.css';

const Topbar = ({
  onToggleSidebar,
  onLogout,
  user,
  isSidebarCollapsed,
  roleName,
  quickLinks,
  notificationsPath,
  profilePath,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  return (
    <nav className="topbar bar">
      <div className="topbar-left">
        <button 
          className="btn btn-link sidebar-toggle"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
        >
          <i className={`bi ${isSidebarCollapsed ? 'bi-chevron-right' : 'bi-chevron-left'} fs-4`}></i>
        </button>
        <span className="topbar-title">
          {roleName ? `Bienvenido ${roleName}` : 'Bienvenido'}
        </span>
      </div>

      <div className="topbar-right">
        {/* Search */}
        <div className="search-container">
          <div className="input-group">
            <span className="input-group-text">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="search"
              className="form-control"
              placeholder="Buscar..."
              aria-label="Buscar en el sistema"
            />
          </div>
        </div>

        {quickLinks.length > 0 && (
          <div className="topbar-quick-links">
            {quickLinks.map((link) => (
              <Link
                key={link.key}
                to={link.path}
                className="btn btn-outline-light btn-sm quick-link"
              >
                {link.icon && <i className={`bi ${link.icon} me-1`}></i>}
                <span>{link.label}</span>
              </Link>
            ))}
          </div>
        )}

        {/* Notifications */}
        <div className="topbar-actions">
          {notificationsPath && (
            <Link to={notificationsPath} className="btn btn-link notification-btn">
              <i className="bi bi-bell fs-5"></i>
              <span className="notification-badge">3</span>
            </Link>
          )}

          {/* Profile dropdown */}
          <div className="dropdown">
            <button
              className="btn btn-link dropdown-toggle profile-btn"
              onClick={toggleDropdown}
              aria-expanded={showDropdown}
            >
              <i className="bi bi-person-circle fs-5"></i>
              <span className="profile-name">{user?.username || 'Usuario'}</span>
            </button>
            
            {showDropdown && (
              <div className="dropdown-menu show">
                {profilePath && (
                  <Link to={profilePath} className="dropdown-item">
                    <i className="bi bi-person me-2"></i>
                    Mi Perfil
                  </Link>
                )}
                {!profilePath && (
                  <span className="dropdown-item disabled">
                    <i className="bi bi-person me-2"></i>
                    Perfil no disponible
                  </span>
                )}
                <div className="dropdown-divider"></div>
                <button 
                  className="dropdown-item text-danger"
                  onClick={onLogout}
                >
                  <i className="bi bi-box-arrow-right me-2"></i>
                  Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {showDropdown && (
        <div 
          className="dropdown-backdrop"
          onClick={() => setShowDropdown(false)}
        ></div>
      )}
    </nav>
  );
};

Topbar.propTypes = {
  onToggleSidebar: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired,
  user: PropTypes.shape({
    username: PropTypes.string,
  }),
  isSidebarCollapsed: PropTypes.bool.isRequired,
  roleName: PropTypes.string,
  quickLinks: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      path: PropTypes.string.isRequired,
      icon: PropTypes.string,
    })
  ),
  notificationsPath: PropTypes.string,
  profilePath: PropTypes.string,
};

Topbar.defaultProps = {
  user: null,
  roleName: '',
  quickLinks: [],
  notificationsPath: null,
  profilePath: '/app/profile',
};

export default Topbar; 