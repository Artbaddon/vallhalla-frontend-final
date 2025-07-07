import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { permissionsAPI } from '../../../services/api';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

const Permissions = () => {
  const [editingPermission, setEditingPermission] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const queryClient = useQueryClient();

  const { data: permissions = [], isLoading } = useQuery('permissions', permissionsAPI.getAll);

  const createMutation = useMutation(permissionsAPI.create, {
    onSuccess: () => {
      queryClient.invalidateQueries('permissions');
      toast.success('Permiso creado exitosamente');
      resetForm();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al crear permiso');
    }
  });

  const updateMutation = useMutation(
    ({ id, data }) => permissionsAPI.update(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('permissions');
        toast.success('Permiso actualizado exitosamente');
        resetForm();
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Error al actualizar permiso');
      }
    }
  );

  const deleteMutation = useMutation(permissionsAPI.delete, {
    onSuccess: () => {
      queryClient.invalidateQueries('permissions');
      toast.success('Permiso eliminado exitosamente');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al eliminar permiso');
    }
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingPermission) {
      updateMutation.mutate({ id: editingPermission.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (permission) => {
    setEditingPermission(permission);
    setFormData({ name: permission.name, description: permission.description });
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: '¿Está seguro?',
      text: "Esta acción no se puede deshacer",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        deleteMutation.mutate(id);
      }
    });
  };

  const resetForm = () => {
    setEditingPermission(null);
    setFormData({ name: '', description: '' });
  };

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-md-4">
          <div className="card">
            <div className="card-header">
              <h5>{editingPermission ? 'Editar Permiso' : 'Crear Permiso'}</h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">Nombre</label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="ej: users:read"
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="description" className="form-label">Descripción</label>
                  <textarea
                    className="form-control"
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    placeholder="ej: Permite leer datos de usuarios"
                  ></textarea>
                </div>
                <div className="d-flex justify-content-between">
                  <button type="submit" className="btn btn-primary">
                    {editingPermission ? 'Actualizar' : 'Crear'}
                  </button>
                  {editingPermission && (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={resetForm}
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
        <div className="col-md-8">
          <div className="card">
            <div className="card-header">
              <h5>Permisos</h5>
            </div>
            <div className="card-body">
              {isLoading ? (
                <div className="text-center">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Cargando...</span>
                  </div>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Descripción</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {permissions.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="text-center">No hay permisos registrados</td>
                        </tr>
                      ) : (
                        permissions.map((permission) => (
                          <tr key={permission.id}>
                            <td>{permission.id}</td>
                            <td>{permission.name}</td>
                            <td>{permission.description}</td>
                            <td>
                              <button
                                className="btn btn-sm btn-outline-primary me-2"
                                onClick={() => handleEdit(permission)}
                              >
                                Editar
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleDelete(permission.id)}
                              >
                                Eliminar
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Permissions; 