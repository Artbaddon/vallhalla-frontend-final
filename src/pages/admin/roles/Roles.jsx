import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { rolesAPI } from '../../../services/api';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

const Roles = () => {
  const [editingRole, setEditingRole] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const queryClient = useQueryClient();

  const { data: roles = [], isLoading } = useQuery('roles', rolesAPI.getAll);

  const createMutation = useMutation(rolesAPI.create, {
    onSuccess: () => {
      queryClient.invalidateQueries('roles');
      toast.success('Rol creado exitosamente');
      resetForm();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al crear rol');
    }
  });

  const updateMutation = useMutation(
    ({ id, data }) => rolesAPI.update(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('roles');
        toast.success('Rol actualizado exitosamente');
        resetForm();
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Error al actualizar rol');
      }
    }
  );

  const deleteMutation = useMutation(rolesAPI.delete, {
    onSuccess: () => {
      queryClient.invalidateQueries('roles');
      toast.success('Rol eliminado exitosamente');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al eliminar rol');
    }
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingRole) {
      updateMutation.mutate({ id: editingRole.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (role) => {
    setEditingRole(role);
    setFormData({ name: role.name, description: role.description });
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
    setEditingRole(null);
    setFormData({ name: '', description: '' });
  };

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-md-4">
          <div className="card">
            <div className="card-header">
              <h5>{editingRole ? 'Editar Rol' : 'Crear Rol'}</h5>
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
                  ></textarea>
                </div>
                <div className="d-flex justify-content-between">
                  <button type="submit" className="btn btn-primary">
                    {editingRole ? 'Actualizar' : 'Crear'}
                  </button>
                  {editingRole && (
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
              <h5>Roles</h5>
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
                      {roles.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="text-center">No hay roles registrados</td>
                        </tr>
                      ) : (
                        roles.map((role) => (
                          <tr key={role.id}>
                            <td>{role.id}</td>
                            <td>{role.name}</td>
                            <td>{role.description}</td>
                            <td>
                              <button
                                className="btn btn-sm btn-outline-primary me-2"
                                onClick={() => handleEdit(role)}
                              >
                                Editar
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleDelete(role.id)}
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

export default Roles; 