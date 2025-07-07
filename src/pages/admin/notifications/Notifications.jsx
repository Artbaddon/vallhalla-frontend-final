import React, { useState, useEffect } from 'react';
import { notificationsAPI } from '../../../services/api';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingNotification, setEditingNotification] = useState(null);
  const [formData, setFormData] = useState({
    type_id: '1',
    description: '',
    user_id: null // null for global notifications
  });

  // Notification types (simplified)
  const notificationTypes = [
    { id: 1, name: 'Información General' },
    { id: 2, name: 'Mantenimiento' },
    { id: 3, name: 'Eventos' },
    { id: 4, name: 'Seguridad' },
    { id: 5, name: 'Administración' }
  ];

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationsAPI.getAll();
      const notificationData = response.notifications || response.data || response || [];
      setNotifications(Array.isArray(notificationData) ? notificationData : []);
    } catch (error) {
      console.error('Error loading notifications:', error);
      alert('Error al cargar las notificaciones');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingNotification(null);
    setFormData({
      type_id: '1',
      description: '',
      user_id: null
    });
    setShowModal(true);
  };

  const handleEdit = (notification) => {
    setEditingNotification(notification);
    setFormData({
      type_id: notification.Notification_type_FK_ID?.toString() || '1',
      description: notification.Notification_description || '',
      user_id: notification.Notification_User_FK_ID || null
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.description.trim()) {
      alert('La descripción es requerida');
      return;
    }

    try {
      const submitData = {
        type_id: parseInt(formData.type_id),
        description: formData.description.trim(),
        user_id: formData.user_id || 0 // 0 for global notifications
      };

      if (editingNotification) {
        await notificationsAPI.update(editingNotification.Notification_id, submitData);
        alert('Notificación actualizada exitosamente');
      } else {
        await notificationsAPI.create(submitData);
        alert('Notificación creada exitosamente');
      }

      setShowModal(false);
      await loadNotifications();
    } catch (error) {
      console.error('Error saving notification:', error);
      alert('Error al guardar la notificación');
    }
  };

  const handleDelete = async (notification) => {
    if (window.confirm('¿Está seguro de que desea eliminar esta notificación?')) {
      try {
        await notificationsAPI.delete(notification.Notification_id);
        alert('Notificación eliminada exitosamente');
        await loadNotifications();
      } catch (error) {
        console.error('Error deleting notification:', error);
        alert('Error al eliminar la notificación');
      }
    }
  };

  const getTypeName = (typeId) => {
    const type = notificationTypes.find(t => t.id === typeId);
    return type ? type.name : 'Desconocido';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="container-fluid p-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Gestión de Notificaciones</h2>
        <button className="btn btn-primary" onClick={handleCreate}>
          <i className="bi bi-plus me-2"></i>
          Crear Notificación
        </button>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tipo</th>
                  <th>Descripción</th>
                  <th>Alcance</th>
                  <th>Fecha</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {notifications.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4">
                      <i className="bi bi-bell display-4 text-muted"></i>
                      <p className="text-muted mt-2">No hay notificaciones registradas</p>
                    </td>
                  </tr>
                ) : (
                  notifications.map((notification) => (
                    <tr key={notification.Notification_id}>
                      <td>{notification.Notification_id}</td>
                      <td>
                        <span className="badge bg-info">
                          {getTypeName(notification.Notification_type_FK_ID)}
                        </span>
                      </td>
                      <td>
                        <div className="text-truncate" style={{ maxWidth: '300px' }}>
                          {notification.Notification_description}
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${notification.Notification_User_FK_ID ? 'bg-warning' : 'bg-success'}`}>
                          {notification.Notification_User_FK_ID ? 'Usuario específico' : 'Global'}
                        </span>
                      </td>
                      <td>
                        <small className="text-muted">
                          {formatDate(notification.Notification_createdAt)}
                        </small>
                      </td>
                      <td>
                        <div className="btn-group">
                          <button
                            className="btn btn-sm btn-outline-warning"
                            onClick={() => handleEdit(notification)}
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(notification)}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingNotification ? 'Editar Notificación' : 'Crear Notificación'}
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Tipo de Notificación</label>
                    <select
                      className="form-select"
                      value={formData.type_id}
                      onChange={(e) => setFormData({...formData, type_id: e.target.value})}
                      required
                    >
                      {notificationTypes.map(type => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Descripción</label>
                    <textarea
                      className="form-control"
                      rows="4"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Escriba el contenido de la notificación..."
                      required
                    />
                  </div>
                  
                  <div className="mb-3">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="globalNotification"
                        checked={!formData.user_id}
                        onChange={(e) => setFormData({...formData, user_id: e.target.checked ? null : 1})}
                      />
                      <label className="form-check-label" htmlFor="globalNotification">
                        Notificación global (visible para todos)
                      </label>
                    </div>
                    <small className="text-muted">
                      Las notificaciones globales se muestran en la página principal
                    </small>
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setShowModal(false)}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingNotification ? 'Actualizar' : 'Crear'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications; 