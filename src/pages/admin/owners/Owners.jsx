import React, { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { ownersAPI } from "../../../services/api";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import OwnerModal from "./OwnerModal";
import "./Owners.css";

const Owners = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingOwner, setEditingOwner] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();

  // Fetch raw owners data (backend format)
  const {
    data: ownersRaw = [],
    isLoading,
    error,
  } = useQuery("owners", ownersAPI.getDetails, {
    onSuccess: (owners) => {
      console.log("Owners data received (raw):", owners);
    },
    onError: (err) => {
      console.error("Error fetching owners:", err);
    },
  });

  // Mapea el array crudo a un formato limpio y consistente para frontend
  const owners = useMemo(() => {
    return ownersRaw.map((owner) => ({
      id: owner.Owner_id,
      userId: owner.User_FK_ID,
      isTenant: Boolean(owner.Owner_is_tenant),
      birthDate: owner.Owner_birth_date,
      createdAt: owner.Owner_createdAt,
      updatedAt: owner.Owner_updatedAt,
      username: owner.Users_name,
      userStatusId: owner.User_status_FK_ID,
      userStatusName: owner.User_status_name,
      fullName: owner.Profile_fullName,
      firstName: owner.Owner_first_name || "", // Si vienen separados
      lastName: owner.Owner_last_name || "",
      email: owner.Owner_email || "",
      phone: owner.Owner_phone || "",
      documentType: owner.Profile_document_type || "",
      documentNumber: owner.Profile_document_number || "",
      // Puedes agregar más campos según necesites
    }));
  }, [ownersRaw]);

  // Filtra sobre el array ya mapeado
  const filteredOwners = useMemo(() => {
    if (!searchTerm) return owners;
    return owners.filter((owner) => {
      const fullName = owner.fullName.toLowerCase();
      const firstName = owner.firstName.toLowerCase();
      const lastName = owner.lastName.toLowerCase();
      const email = owner.email.toLowerCase();
      const documentNumber = owner.documentNumber;

      const term = searchTerm.toLowerCase();
      return (
        fullName.includes(term) ||
        firstName.includes(term) ||
        lastName.includes(term) ||
        email.includes(term) ||
        documentNumber.includes(term)
      );
    });
  }, [owners, searchTerm]);

  const handleCreate = () => {
    setEditingOwner(null);
    setShowModal(true);
  };

  // Al editar pasamos el objeto ya mapeado
  const handleEdit = (owner) => {
    setEditingOwner(owner);
    setShowModal(true);
  };

  const handleDelete = (owner) => {
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
        deleteMutation.mutate(owner.id); // usar id mapeado
      }
    });
  };

  const handleView = (owner) => {
    Swal.fire({
      title: "Detalles del Propietario",
      html: `
      <div class="text-start">
        <p><strong>Nombre completo:</strong> ${
          owner.fullName || `${owner.firstName} ${owner.lastName}`
        }</p>
        <p><strong>Documento:</strong> ${owner.documentType} ${
        owner.documentNumber
      }</p>
        <p><strong>Fecha de Nacimiento:</strong> ${
          owner.birthDate ? new Date(owner.birthDate).toLocaleDateString() : ""
        }</p>
        <p><strong>Email:</strong> ${owner.email}</p>
        <p><strong>Teléfono:</strong> ${owner.phone}</p>
        <p><strong>Es inquilino:</strong> ${owner.isTenant ? "Sí" : "No"}</p>
      </div>
    `,
      confirmButtonText: "Cerrar",
    });
  };

  // Mutations (igual que antes)
  const createMutation = useMutation(ownersAPI.create, {
    onSuccess: () => {
      queryClient.invalidateQueries("owners");
      toast.success("Propietario creado exitosamente");
      setShowModal(false);
    },
    onError: (error) => {
      console.error("Create Owner Error:", error);
      toast.error(
        error.response?.data?.message || "Error al crear propietario"
      );
    },
  });

  const updateMutation = useMutation(
    ({ id, data }) => ownersAPI.update(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("owners");
        toast.success("Propietario actualizado exitosamente");
        setShowModal(false);
        setEditingOwner(null);
      },
      onError: (error) => {
        console.error("Update Owner Error:", error);
        toast.error(
          error.response?.data?.message || "Error al actualizar propietario"
        );
      },
    }
  );

  const deleteMutation = useMutation(ownersAPI.delete, {
    onSuccess: () => {
      queryClient.invalidateQueries("owners");
      toast.success("Propietario eliminado exitosamente");
    },
    onError: (error) => {
      console.error("Delete Owner Error:", error);
      toast.error(
        error.response?.data?.message || "Error al eliminar propietario"
      );
    },
  });

  const handleSubmit = (formData) => {
    if (editingOwner) {
      updateMutation.mutate({ id: editingOwner.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        Error al cargar los propietarios: {error.message}
      </div>
    );
  }

  return (
    <div className="owners-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Gestión de Propietarios</h1>
          <p className="text-muted">
            Administre la información de los propietarios del conjunto
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={handleCreate}
          disabled={isLoading}
        >
          <i className="bi bi-plus-lg"></i> Añadir Propietario
        </button>
      </div>

      {/* Search and Filters */}
      <div className="search-section">
        <div className="input-group">
          <span className="input-group-text">
            <i className="bi bi-search"></i>
          </span>
          <input
            type="text"
            className="form-control"
            placeholder="Buscar propietarios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Owners Table */}
      <div className="table-container">
        <div className="table-header">
          <h3>Lista de Propietarios</h3>
          <span className="badge bg-primary">
            {filteredOwners.length} propietarios
          </span>
        </div>

        {isLoading ? (
          <div className="loading-container">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
            <p>Cargando propietarios...</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Nombre completo</th>
                  <th>Email</th>
                  <th>Documento</th>
                  <th>Teléfono</th>
                  <th>Inquilino</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredOwners.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center text-muted py-4">
                      {searchTerm
                        ? "No se encontraron propietarios con ese criterio"
                        : "No hay propietarios registrados"}
                    </td>
                  </tr>
                ) : (
                  filteredOwners.map((owner) => (
                    <tr key={owner.id}>
                      <td>
                        {owner.fullName ||
                          `${owner.firstName} ${owner.lastName}`}
                      </td>
                      <td>{owner.email}</td>
                      <td>
                        {owner.documentType} {owner.documentNumber}
                      </td>
                      <td>{owner.phone}</td>
                      <td>
                        <span
                          className={`badge ${
                            owner.isTenant ? "bg-success" : "bg-secondary"
                          }`}
                        >
                          {owner.isTenant ? "Sí" : "No"}
                        </span>
                      </td>
                      <td>
                        <div className="btn-group" role="group">
                          <button
                            type="button"
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => handleView(owner)}
                            title="Ver detalles"
                          >
                            <i className="bi bi-eye"></i>
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-secondary btn-sm"
                            onClick={() => handleEdit(owner)}
                            title="Editar"
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => handleDelete(owner)}
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

      {/* Owner Modal */}
      <OwnerModal
        show={showModal}
        onHide={() => {
          setShowModal(false);
          setEditingOwner(null);
        }}
        onSubmit={handleSubmit}
        owner={editingOwner}
        isLoading={createMutation.isLoading || updateMutation.isLoading}
      />
    </div>
  );
};

export default Owners;