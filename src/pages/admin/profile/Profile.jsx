import React from 'react';

const Profile = () => {
  return (
    <div className="profile-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Mi Perfil</h1>
          <p className="text-muted">Administre su información personal</p>
        </div>
        <button className="btn btn-primary">
          <i className="bi bi-pencil"></i> Editar Perfil
        </button>
      </div>

      <div className="coming-soon">
        <div className="coming-soon-content">
          <i className="bi bi-person display-1 text-primary"></i>
          <h2>Próximamente</h2>
          <p>La gestión del perfil estará disponible en la próxima actualización.</p>
        </div>
      </div>
    </div>
  );
};

export default Profile; 