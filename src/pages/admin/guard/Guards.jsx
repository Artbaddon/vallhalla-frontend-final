import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { guardsAPI } from "../../../services/api";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import GuardModal from "./GuardModal";
import './Guards.css';

const Guards = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingGuard, setEditingGuard] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [shiftFilter, setShiftFilter] = useState("");
  const queryClient = useQueryClient();

  // Fetch guards data
  const {
    data: guardsData = { data: [] },
    isLoading,
    error,
  } = useQuery("guards", guardsAPI.getAll, {
    onSuccess: (data) => {
      console.log("Guards data received:", data);
    },
    onError: (err) => {
      console.error("Error fetching guards:", err);
    },
  });

  // Extract guards array from response
  const guards = useMemo(() => {
    return guardsData.data || [];
  }, [guardsData]);

  // Filter guards based on search term and shift
  const filteredGuards = useMemo(() => {
    let filtered = guards;

    if (searchTerm) {
      filtered = filtered.filter((guard) => {
        const fullName = guard.fullName?.toLowerCase() || '';
        const username = guard.username?.toLowerCase() || '';
        const documentNumber = guard.documentNumber || '';

        const term = searchTerm.toLowerCase();
        return (
          fullName.includes(term) ||
          username.includes(term) ||
          documentNumber.includes(term)
        );
      });
    }

    if (shiftFilter) {
      filtered = filtered.filter(guard => guard.shift === shiftFilter);
    }

    return filtered;
  }, [guards, searchTerm, shiftFilter]);

  const handleCreate = () => {
    setEditingGuard(null);
    setShowModal(true);
  };

  const handleEdit = (guard) => {
    setEditingGuard(guard);
    setShowModal(true);
  };

  const handleDelete = (guard) => {
    Swal.fire({
      title: "¿Está seguro?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteMutation.mutate(guard.id);
      }
    });
  };

  const handleView = (guard) => {
    const shiftLabels = {
      'Morning': 'Mañana',
      'Afternoon': 'Tarde',
      'Evening': 'Noche',
      'Night': 'Madrugada'
    };

    Swal.fire({
      title: "Detalles del Vigilante",
      html: `
      <div class="text-start">
        <p><strong>Nombre completo:</strong> ${guard.fullName || 'N/A'}</p>
        <p><strong>Usuario:</strong> ${guard.username || 'N/A'}</p>
        <p><strong>Documento:</strong> ${guard.documentNumber || 'N/A'}</p>
        <p><strong>Teléfono:</strong> ${guard.telephoneNumber || 'N/A'}</p>
        <p><strong>Turno:</strong> ${shiftLabels[guard.shift] || guard.shift}</p>
        <p><strong>ARL:</strong> ${guard.arl || 'N/A'}</p>
        <p><strong>EPS:</strong> ${guard.eps || 'N/A'}</p>
        <p><strong>Estado:</strong> ${guard.status || 'N/A'}</p>
        <p><strong>Fecha de creación:</strong> ${
          guard.createdAt ? new Date(guard.createdAt).toLocaleDateString() : 'N/A'
        }</p>
      </div>
    `,
      confirmButtonText: "Cerrar",
    });
  };

  // Mutations
  const createMutation = useMutation(guardsAPI.create, {
    onSuccess: () => {
      queryClient.invalidateQueries("guards");
      toast.success("Vigilante creado exitosamente");
      setShowModal(false);
    },
    onError: (error) => {
      console.error("Create Guard Error:", error);
      toast.error(
        error.response?.data?.error || "Error al crear vigilante"
      );
    },
  });

  const updateMutation = useMutation(
    ({ id, data }) => guardsAPI.update(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("guards");
        toast.success("Vigilante actualizado exitosamente");
        setShowModal(false);
        setEditingGuard(null);
      },
      onError: (error) => {
        console.error("Update Guard Error:", error);
        toast.error(
          error.response?.data?.error || "Error al actualizar vigilante"
        );
      },
    }
  );

  const deleteMutation = useMutation(guardsAPI.delete, {
    onSuccess: () => {
      queryClient.invalidateQueries("guards");
      toast.success("Vigilante eliminado exitosamente");
    },
    onError: (error) => {
      console.error("Delete Guard Error:", error);
      toast.error(
        error.response?.data?.error || "Error al eliminar vigilante"
      );
    },
  });

  const handleSubmit = (formData) => {
    if (editingGuard) {
      updateMutation.mutate({ id: editingGuard.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const getShiftLabel = (shift) => {
    const labels = {
      'Morning': 'Mañana',
      'Afternoon': 'Tarde',
      'Evening': 'Noche',
      'Night': 'Madrugada'
    };
    return labels[shift] || shift;
  };

  const getShiftBadgeClass = (shift) => {
    const classes = {
      'Morning': 'bg-warning',
      'Afternoon': 'bg-info',
      'Evening': 'bg-primary',
      'Night': 'bg-dark'
    };
    return classes[shift] || 'bg-secondary';
  };

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        Error al cargar los vigilantes: {error.message}
      </div>
    );
  }

  return (
    <div className="guards-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Gestión de Vigilantes</h1>
          <p>Administre el personal de seguridad del conjunto</p>
        </div>
        <button
          className="btn btn-outline-primary"
          onClick={handleCreate}
          disabled={isLoading}
        >
          <i className="bi bi-plus-lg"></i> Añadir Vigilante
        </button>
      </div>

      {/* Search and Filters */}
      <div className="search-section">
        <div className="row">
          <div className="col-md-6">
            <div className="input-group">
              <span className="input-group-text">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Buscar vigilantes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-6">
            <select
              className="form-select"
              value={shiftFilter}
              onChange={(e) => setShiftFilter(e.target.value)}
            >
              <option value="">Todos los turnos</option>
              <option value="Morning">Mañana</option>
              <option value="Afternoon">Tarde</option>
              <option value="Evening">Noche</option>
              <option value="Night">Madrugada</option>
            </select>
          </div>
        </div>
      </div>

      {/* Guards Table */}
      <div className="table-container">
        <div className="table-header">
          <h3>Lista de Vigilantes</h3>
          <span className="badge bg-primary">
            {filteredGuards.length} vigilantes
          </span>
        </div>

        {isLoading ? (
          <div className="loading-container">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
            <p>Cargando vigilantes...</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Nombre completo</th>
                  <th>Usuario</th>
                  <th>Documento</th>
                  <th>Teléfono</th>
                  <th>Turno</th>
                  <th>ARL</th>
                  <th>EPS</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredGuards.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center text-muted py-4">
                      {searchTerm || shiftFilter
                        ? "No se encontraron vigilantes con ese criterio"
                        : "No hay vigilantes registrados"}
                    </td>
                  </tr>
                ) : (
                  filteredGuards.map((guard) => (
                    <tr key={guard.id}>
                      <td>{guard.fullName || 'N/A'}</td>
                      <td>{guard.username || 'N/A'}</td>
                      <td>{guard.documentNumber || 'N/A'}</td>
                      <td>{guard.telephoneNumber || 'N/A'}</td>
                      <td>
                        <span className={`badge ${getShiftBadgeClass(guard.shift)}`}>
                          {getShiftLabel(guard.shift)}
                        </span>
                      </td>
                      <td>{guard.arl || 'N/A'}</td>
                      <td>{guard.eps || 'N/A'}</td>
                      <td>
                        <div className="btn-group" role="group">
                          <button
                            type="button"
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => handleView(guard)}
                            title="Ver detalles"
                          >
                            <i className="bi bi-eye"></i>
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-secondary btn-sm"
                            onClick={() => handleEdit(guard)}
                            title="Editar"
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => handleDelete(guard)}
                            title="Eliminar"
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
        )}
      </div>

      {/* Guard Modal */}
      <GuardModal
        show={showModal}
        onHide={() => {
          setShowModal(false);
          setEditingGuard(null);
        }}
        onSubmit={handleSubmit}
        guard={editingGuard}
        isLoading={createMutation.isLoading || updateMutation.isLoading}
      />
    </div>
  );
};

export default Guards; 