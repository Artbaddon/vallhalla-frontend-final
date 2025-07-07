import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Topbar.css';

const Topbar = ({ onToggleSidebar, onLogout, user, isSidebarCollapsed }) => {
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
        <span className="topbar-title">BIENVENIDO ADMINISTRADOR</span>
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

        {/* Notifications */}
        <div className="topbar-actions">
          <Link to="/admin/notifications" className="btn btn-link notification-btn">
            <i className="bi bi-bell fs-5"></i>
            <span className="notification-badge">3</span>
          </Link>

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
                <Link to="/admin/profile" className="dropdown-item">
                  <i className="bi bi-person me-2"></i>
                  Mi Perfil
                </Link>
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

export default Topbar; 