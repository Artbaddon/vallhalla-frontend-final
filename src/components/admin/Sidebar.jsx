import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import './Sidebar.css';

const Sidebar = ({ isOpen, onToggle, currentPath, items }) => {
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
          {items.map((item) => {
            if (item.type === 'section') {
              return (
                <li key={item.key} className="sidebar-header">
                  <span>{item.label}</span>
                </li>
              );
            }

            if (item.type === 'link') {
              return (
                <li key={item.key} className={isActive(item.path)}>
                  <Link to={item.path}>
                    {item.icon && <i className={`bi ${item.icon}`}></i>}
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            }

            return null;
          })}
        </ul>
      </div>
    </div>
  );
};

Sidebar.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
  currentPath: PropTypes.string,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      type: PropTypes.oneOf(['section', 'link']).isRequired,
      key: PropTypes.string.isRequired,
      label: PropTypes.string,
      icon: PropTypes.string,
      path: PropTypes.string,
    })
  ),
};

Sidebar.defaultProps = {
  currentPath: undefined,
  items: [],
};

export default Sidebar;