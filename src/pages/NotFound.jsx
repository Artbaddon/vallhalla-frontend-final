import React from 'react';
import { Link } from 'react-router-dom';
import './NotFound.css';

const NotFound = () => {
  return (
    <div className="not-found">
      <div className="not-found-content">
        <div className="not-found-icon">
          <i className="bi bi-exclamation-triangle"></i>
        </div>
        <h1>404</h1>
        <h2>Página no encontrada</h2>
        <p>Lo sentimos, la página que buscas no existe o ha sido movida.</p>
        <Link to="/" className="btn btn-primary">
          <i className="bi bi-house me-2"></i>
          Volver al inicio
        </Link>
      </div>
    </div>
  );
};

export default NotFound; 