import React from 'react';

const Tenants = () => {
  return (
    <div className="tenants-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Gestión de Arrendatarios</h1>
          <p className="text-muted">Administre los arrendatarios del conjunto residencial</p>
        </div>
        <button className="btn btn-primary">
          <i className="bi bi-plus-lg"></i> Añadir Arrendatario
        </button>
      </div>

      <div className="coming-soon">
        <div className="coming-soon-content">
          <i className="bi bi-person-check display-1 text-primary"></i>
          <h2>Próximamente</h2>
          <p>La gestión de arrendatarios estará disponible en la próxima actualización.</p>
        </div>
      </div>
    </div>
  );
};

export default Tenants; 