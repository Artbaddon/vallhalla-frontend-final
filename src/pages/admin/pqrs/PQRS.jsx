import React, { useState, useEffect } from "react";
import { pqrsAPI, pqrsCategoriesAPI } from "../../../services/api";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import PQRSModal from "./PQRSModal";
import "./PQRS.css";

const PQRS = () => {
  const [pqrsList, setPqrsList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // 'create', 'edit', 'view'
  const [selectedPQRS, setSelectedPQRS] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [pqrsRes, categoriesRes] = await Promise.all([
        pqrsAPI.getAll(),
        pqrsCategoriesAPI.getAll(),
      ]);

      console.log("PQRS API Response:", pqrsRes);
      console.log("Categories API Response:", categoriesRes);

      // Handle PQRS data
      const pqrsData = pqrsRes?.data || pqrsRes?.pqrs || pqrsRes || [];
      setPqrsList(Array.isArray(pqrsData) ? pqrsData : []);

      // Handle categories data
      const categoriesData =
        categoriesRes?.categories || categoriesRes?.data || categoriesRes || [];
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch (error) {
      console.error("Error loading data:", error);
      setError("Error al cargar los datos: " + error.message);
      toast.error("Error al cargar los datos");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedPQRS(null);
    setModalMode("create");
    setShowModal(true);
  };

  const handleEdit = (pqrs) => {
    setSelectedPQRS(pqrs);
    setModalMode("edit");
    setShowModal(true);
  };

  const handleView = (pqrs) => {
    setSelectedPQRS(pqrs);
    setModalMode("view");
    setShowModal(true);
  };

  const handleDelete = async (pqrs) => {
    const result = await Swal.fire({
      title: "¿Está seguro?",
      text: `¿Desea eliminar el PQRS "${pqrs.PQRS_subject}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        await pqrsAPI.delete(pqrs.PQRS_id);
        toast.success("PQRS eliminado exitosamente");
        await loadData();
      } catch (error) {
        console.error("Error deleting PQRS:", error);
        toast.error("Error al eliminar PQRS: " + error.message);
      }
    }
  };

  const handleUpdateStatus = (pqrs) => {
    const statusOptions = {
      1: "Pendiente",
      2: "En proceso",
      3: "Resuelto",
      4: "Cerrado",
    };

    // Create options for the select dropdown
    const selectOptions = Object.entries(statusOptions)
      .map(
        ([value, label]) =>
          `<option value="${value}" ${
            pqrs.current_status_id == value ? "selected" : ""
          }>${label}</option>`
      )
      .join("");

    Swal.fire({
      title: "Actualizar Estado del PQRS",
      html: `
        <div class="mb-3">
          <label for="status-select" class="form-label">Nuevo Estado:</label>
          <select id="status-select" class="form-select">
            ${selectOptions}
          </select>
        </div>
        <div class="mb-3">
          <label for="admin-response" class="form-label">Respuesta del Administrador:</label>
          <textarea id="admin-response" class="form-control" rows="3" placeholder="Ingrese una respuesta o comentario..."></textarea>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Actualizar",
      cancelButtonText: "Cancelar",
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        const statusId = document.getElementById("status-select").value;
        const adminResponse = document.getElementById("admin-response").value;

        if (!statusId) {
          Swal.showValidationMessage("Por favor seleccione un estado");
          return false;
        }

        try {
          await pqrsAPI.updateStatus(pqrs.PQRS_id, {
            status_id: parseInt(statusId),
            admin_response: adminResponse || "",
          });
          toast.success("Estado actualizado exitosamente");
          await loadData();
        } catch (error) {
          console.error("Error updating status:", error);
          toast.error("Error al actualizar estado: " + error.message);
        }
      },
    });
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedPQRS(null);
  };

  const handleModalSave = async () => {
    setShowModal(false);
    await loadData();
  };

  // Filter PQRS by status and category
  const getFilteredPQRS = () => {
    return pqrsList.filter((pqrs) => {
      const statusMatch =
        statusFilter === "all" ||
        (pqrs.current_status_id &&
          pqrs.current_status_id.toString() === statusFilter);

      const categoryMatch =
        categoryFilter === "all" ||
        (pqrs.PQRS_category_FK_ID &&
          pqrs.PQRS_category_FK_ID.toString() === categoryFilter);

      return statusMatch && categoryMatch;
    });
  };

  // Get status name
  const getStatusName = (statusId) => {
    const statuses = {
      1: "Pendiente",
      2: "En proceso",
      3: "Resuelto",
      4: "Cerrado",
    };
    return statuses[statusId] || "Sin estado";
  };

  // Get status badge class
  const getStatusBadgeClass = (statusId) => {
    const classes = {
      1: "badge bg-warning",
      2: "badge bg-primary",
      3: "badge bg-success",
      4: "badge bg-secondary",
    };
    return classes[statusId] || "badge bg-light";
  };

  // Get category name
  const getCategoryName = (categoryId) => {
    const category = categories.find(
      (cat) => cat.id === categoryId || cat.PQRS_category_id === categoryId
    );
    return category
      ? category.name || category.PQRS_category_name
      : "Sin categoría";
  };

  // Check if PQRS has attachments
  const hasAttachments = (pqrs) => {
    return pqrs.PQRS_file && pqrs.PQRS_file.trim().length > 0;
  };

  // Get attachment count
  const getAttachmentCount = (pqrs) => {
    if (!pqrs.PQRS_file) return 0;
    return pqrs.PQRS_file.split(",").filter((file) => file.trim().length > 0)
      .length;
  };

  if (loading) {
    return (
      <div className="container-fluid p-4">
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ minHeight: "400px" }}
        >
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid p-4">
        <div className="alert alert-danger" role="alert">
          {error}
          <button className="btn btn-outline-danger ms-2" onClick={loadData}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const filteredPQRS = getFilteredPQRS();

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Gestión de PQRS</h2>
        <button className="btn btn-primary" onClick={handleCreate}>
          <i className="bi bi-plus me-2"></i>
          Crear PQRS
        </button>
      </div>

      <div className="card">
        <div className="card-header bg-white">
          <div className="row">
            <div className="col-md-6">
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-funnel me-1"></i>
                  Estado
                </span>
                <select
                  className="form-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">Todos los estados</option>
                  <option value="1">Pendiente</option>
                  <option value="2">En proceso</option>
                  <option value="3">Resuelto</option>
                  <option value="4">Cerrado</option>
                </select>
              </div>
            </div>
            <div className="col-md-6">
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-tag me-1"></i>
                  Categoría
                </span>
                <select
                  className="form-select"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="all">Todas las categorías</option>
                  {categories.map((category) => (
                    <option
                      key={category.id || category.PQRS_category_id}
                      value={(
                        category.id || category.PQRS_category_id
                      ).toString()}
                    >
                      {category.name || category.PQRS_category_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Asunto</th>
                  <th>Categoría</th>
                  <th>Propietario</th>
                  <th>Estado</th>
                  <th>Prioridad</th>
                  <th>Archivos</th>
                  <th>Fecha</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredPQRS.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center py-4">
                      <div className="text-center">
                        <i className="bi bi-inbox display-4 text-muted"></i>
                        <p className="text-muted mt-2">
                          {statusFilter !== "all" || categoryFilter !== "all"
                            ? "No hay PQRS que coincidan con los filtros seleccionados"
                            : "No hay PQRS registrados"}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredPQRS.map((pqrs) => (
                    <tr key={pqrs.PQRS_id}>
                      <td>
                        <span className="fw-bold">{pqrs.PQRS_id}</span>
                      </td>
                      <td>
                        <div
                          className="text-truncate"
                          style={{ maxWidth: "200px" }}
                          title={pqrs.PQRS_subject}
                        >
                          {pqrs.PQRS_subject}
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-secondary">
                          {pqrs.PQRS_category_name ||
                            getCategoryName(pqrs.PQRS_category_FK_ID)}
                        </span>
                      </td>
                      <td>{pqrs.owner_name || `ID: ${pqrs.Owner_FK_ID}`}</td>
                      <td>
                        <span
                          className={getStatusBadgeClass(
                            pqrs.current_status_id
                          )}
                        >
                          {getStatusName(pqrs.current_status_id)}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            pqrs.PQRS_priority === "HIGH"
                              ? "bg-danger"
                              : pqrs.PQRS_priority === "MEDIUM"
                              ? "bg-warning"
                              : "bg-info"
                          }`}
                        >
                          {pqrs.PQRS_priority}
                        </span>
                      </td>
                      <td>
                        {hasAttachments(pqrs) ? (
                          <span
                            className="text-success"
                            title={`${getAttachmentCount(
                              pqrs
                            )} archivo(s) adjunto(s)`}
                          >
                            <i className="bi bi-paperclip me-1"></i>
                            {getAttachmentCount(pqrs)}
                          </span>
                        ) : (
                          <span className="text-muted">
                            <i className="bi bi-dash"></i>
                          </span>
                        )}
                      </td>
                      <td>
                        <small className="text-muted">
                          {new Date(pqrs.PQRS_createdAt).toLocaleDateString()}
                        </small>
                      </td>
                      <td>
                        <div className="btn-group">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleView(pqrs)}
                            title="Ver detalles"
                          >
                            <i className="bi bi-eye"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-success"
                            onClick={() => handleUpdateStatus(pqrs)}
                            title="Actualizar estado"
                          >
                            <i className="bi bi-arrow-clockwise"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-warning"
                            onClick={() => handleEdit(pqrs)}
                            title="Editar"
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(pqrs)}
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
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <PQRSModal
          show={showModal}
          mode={modalMode}
          pqrs={selectedPQRS}
          categories={categories}
          onClose={handleModalClose}
          onSave={handleModalSave}
        />
      )}
    </div>
  );
};

export default PQRS;
