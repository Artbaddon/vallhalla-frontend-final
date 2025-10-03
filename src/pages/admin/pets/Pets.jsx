import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { petsAPI } from "../../../services/api";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import PetModal from "./PetModal";
import "./Pets.css";
import useFeatureAccess from "../../../hooks/useFeatureAccess";

const Pets = () => {
  const { can: petsCan } = useFeatureAccess("pets");
  const canView = petsCan.canView;
  const canCreate = petsCan.canCreate;
  const canEdit = petsCan.canEdit;
  const canDelete = petsCan.canDelete;

  const [showModal, setShowModal] = useState(false);
  const [editingPet, setEditingPet] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [speciesFilter, setSpeciesFilter] = useState("all");
  const queryClient = useQueryClient();
  const BASE_URL = "http://localhost:3000";

  // Fetch pets data
  const {
    data: response,
    isLoading,
    error,
  } = useQuery("pets", petsAPI.getAll, {
    enabled: canView,
    onSuccess: (response) => {
      console.log("Pets data received:", response?.data);
    },
    onError: (err) => {
      console.error("Error fetching pets:", err);
    },
  });

  // Ensure pets is always an array
  const petsList = Array.isArray(response?.data)
    ? response.data.map((pet) => ({
        id: pet.Pet_id,
        name: pet.Pet_name,
        species: pet.Pet_species,
        breed: pet.Pet_Breed,
        vaccination_card: pet.Pet_vaccination_card,
        photos: pet.Pet_Photo,
        owner_id: pet.Owner_FK_ID,
        createdAt: pet.createdAt,
        updatedAt: pet.updatedAt,
      }))
    : [];

  // Get unique species for filtering
  const uniqueSpecies = [...new Set(petsList.map((pet) => pet.species))].filter(
    Boolean
  );

  // Mutations
  const createMutation = useMutation(petsAPI.create, {
    onSuccess: () => {
      queryClient.invalidateQueries("pets");
      toast.success("Mascota registrada exitosamente");
      setShowModal(false);
    },
    onError: (error) => {
      console.error("Create Pet Error:", error);
      toast.error(
        error.response?.data?.message || "Error al registrar mascota"
      );
    },
  });

  const updateMutation = useMutation(
    ({ id, data }) => petsAPI.update(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("pets");
        toast.success("Mascota actualizada exitosamente");
        setShowModal(false);
        setEditingPet(null);
      },
      onError: (error) => {
        console.error("Update Pet Error:", error);
        toast.error(
          error.response?.data?.message || "Error al actualizar mascota"
        );
      },
    }
  );

  const deleteMutation = useMutation(petsAPI.delete, {
    onSuccess: () => {
      queryClient.invalidateQueries("pets");
      toast.success("Mascota eliminada exitosamente");
    },
    onError: (error) => {
      console.error("Delete Pet Error:", error);
      toast.error(error.response?.data?.message || "Error al eliminar mascota");
    },
  });

  // Filter pets based on search term and species
  const filteredPets = petsList.filter((pet) => {
    const matchesSearch =
      pet.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pet.breed?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pet.owner_name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSpecies =
      speciesFilter === "all" || pet.species === speciesFilter;

    return matchesSearch && matchesSpecies;
  });

  const handleCreate = () => {
    if (!canCreate) return;
    setEditingPet(null);
    setShowModal(true);
  };

  const handleEdit = (pet) => {
    if (!canEdit) return;
    setEditingPet(pet);
    setShowModal(true);
  };

  const handleDelete = (pet) => {
    if (!canDelete) return;
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
      if (result.isConfirmed && canDelete) {
        deleteMutation.mutate(pet.id);
      }
    });
  };

  const handleView = (pet) => {
    let photoHtml = "";

    if (pet.photos) {
      try {
        // Aseguramos que photos sea siempre array
        const photos = Array.isArray(pet.photos) ? pet.photos : [pet.photos];

        // Construimos el HTML iterando sobre cada foto
        photoHtml = photos
          .map(
            (photo) => `
            <div class="pet-photo-container mb-2">
              <img src="${BASE_URL}/uploads/${photo}" alt="${pet.name}" class="img-pet" style="max-height: 120px;" />
            </div>
          `
          )
          .join("");
      } catch {
        photoHtml = '<p class="text-muted">No hay fotos disponibles</p>';
      }
    } else {
      photoHtml = '<p class="text-muted">No hay fotos disponibles</p>';
    }

    Swal.fire({
      title: pet.name,
      html: `
      <div class="text-start">
        <p><strong>Especie:</strong> ${pet.species || "No especificado"}</p>
        <p><strong>Raza:</strong> ${pet.breed || "No especificado"}</p>
        <p><strong>Propietario:</strong> ${pet.owner_name || "No asignado"}</p>

        <p><strong>Fotos:</strong></p>
        <div class="pet-photos">
          ${photoHtml}
        </div>

        <p><strong>Tarjeta de vacunación:</strong></p>
        <div class="vaccination-card">
  ${
    pet.vaccination_card
      ? `<a href="${BASE_URL}/uploads/${pet.vaccination_card}" target="_blank" class="btn btn-primary">Ver tarjeta de vacunación (PDF)</a>`
      : '<p class="text-muted">No disponible</p>'
  }</div>

      </div>
    `,
      confirmButtonText: "Cerrar",
      width: "600px",
    });
  };

  const handleSubmit = (data) => {
    if (editingPet) {
      if (!canEdit) return;
      updateMutation.mutate({ id: editingPet.id, data });
    } else {
      if (!canCreate) return;
      createMutation.mutate(data);
    }
  };

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        Error al cargar las mascotas: {error.message}
      </div>
    );
  }

  return (
    <div className="pets-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Gestión de Mascotas</h1>
          <p className="text-muted">
            Administre el registro de mascotas en la propiedad
          </p>
        </div>
        {canCreate && (
          <button
            className="btn btn-outline-primary"
            onClick={handleCreate}
            disabled={isLoading}
          >
            <i className="bi bi-plus-lg"></i> Nueva Mascota
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="filters-section">
        <div className="row">
          <div className="col-md-8">
            <div className="input-group">
              <span className="input-group-text">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Buscar mascotas por nombre, raza o propietario..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-4">
            <select
              className="form-select"
              value={speciesFilter}
              onChange={(e) => setSpeciesFilter(e.target.value)}
            >
              <option value="all">Todas las especies</option>
              {uniqueSpecies.map((species, index) => (
                <option key={index} value={species}>
                  {species}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Pets Gallery */}
      <div className="pets-container">
        <div className="table-header">
          <h3>Lista de Mascotas</h3>
          <span className="badge bg-primary">
            {filteredPets.length} Mascotas
          </span>
        </div>

        {isLoading ? (
          <div className="loading-container">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
            <p>Cargando mascotas...</p>
          </div>
        ) : (
          <div className="row">
            {filteredPets.length === 0 ? (
              <div className="col-12 text-center py-5">
                <p className="text-muted">
                  {searchTerm || speciesFilter !== "all"
                    ? "No se encontraron mascotas con ese criterio"
                    : "No hay mascotas registradas"}
                </p>
              </div>
            ) : (
              filteredPets.map((pet) => (
                <div
                  key={pet.id}
                  className="col-12 col-sm-6 col-md-4 col-lg-3 mb-4"
                >
                  <div
                    className="card pet-card h-100"
                    style={{ width: "300px" }}
                  >
                    <div className="card-img-top pet-image-container">
                      {pet.photos ? (
                        <img
                          src={
                            Array.isArray(pet.photos)
                              ? `${BASE_URL}/uploads/${pet.photos[0]}`
                              : `${BASE_URL}/uploads/${pet.photos}`
                          }
                          className="pet-image"
                          alt={pet.name}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src =
                              "/src/assets/images/default-avatar.jpg";
                          }}
                        />
                      ) : (
                        <img
                          src="/src/assets/images/default-avatar.jpg"
                          className="pet-image"
                          alt={pet.name}
                        />
                      )}
                    </div>
                    <div className="card-body">
                      <h5 className="card-title">{pet.name}</h5>
                      <p className="card-text">
                        <span className="badge bg-info me-2">
                          {pet.species}
                        </span>
                        <span className="text-muted">{pet.breed}</span>
                      </p>
                      <p className="card-text">
                        <small className="text-muted">
                          <i className="bi bi-person me-1"></i>
                          {pet.owner_name || "Propietario no asignado"}
                        </small>
                      </p>
                    </div>
                    <div className="card-footer bg-transparent border-top-0">
                      <div className="btn-group w-100" role="group">
                        <button
                          type="button"
                          className="btn btn-outline-primary"
                          onClick={() => handleView(pet)}
                          title="Ver detalles"
                        >
                          <i className="bi bi-eye"></i>
                        </button>
                        {canEdit && (
                          <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={() => handleEdit(pet)}
                            title="Editar"
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                        )}
                        {canDelete && (
                          <button
                            type="button"
                            className="btn btn-outline-danger"
                            onClick={() => handleDelete(pet)}
                            title="Eliminar"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Pet Modal */}
      <PetModal
        show={showModal && (canCreate || canEdit)}
        onHide={() => {
          setShowModal(false);
          setEditingPet(null);
        }}
        onSubmit={handleSubmit}
        pet={editingPet}
        isLoading={createMutation.isLoading || updateMutation.isLoading}
      />
    </div>
  );
};

export default Pets;
