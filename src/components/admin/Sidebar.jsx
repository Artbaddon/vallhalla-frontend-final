import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';
import { Routes } from '../../constants/Routes.js';

const Sidebar = ({ isOpen, onToggle, currentPath }) => {
  const location = useLocation();

  const isActive = (path) => {
    return (currentPath || location.pathname).startsWith(path) ? 'active' : '';
  };

  return (
    <div className={`sidebar ${isOpen ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <h3>Vallhalla</h3>
        <button className="toggle-btn" onClick={onToggle}>
          <i className={`bi ${isOpen ? 'bi-chevron-right' : 'bi-chevron-left'}`}></i>
        </button>
      </div>
      <div className="sidebar-menu">
        <ul>
          {Routes.map((route, index) =>
            route.section ? (
              <li key={index} className="sidebar-header">
                <span>{route.section}</span>
              </li>
            ) : (
              <li key={index} className={isActive(route.path)}>
                <Link to={route.path}>
                  <i className={`bi ${route.icon}`}></i>
                  <span>{route.label}</span>
                </Link>
              </li>
            )
          )}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;