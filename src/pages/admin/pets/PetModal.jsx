import React, { useEffect, useMemo, useState } from "react";
import { useQuery } from "react-query";
import { ownersAPI } from "../../../services/api";

const PetModal = ({ show, onHide, onSubmit, pet, isLoading }) => {
  const [formData, setFormData] = useState({
    // campos texto
    name: "",
    species: "",
    breed: "",
    owner_id: "",
    // para archivos almacenamos los objetos File o FileList
  vaccination_card: null,
  photos: null,
  });

  // Fetch owners for dropdown
  const { data: ownersResponse } = useQuery("owners", ownersAPI.getDetails, {
    enabled: show,
    onError: (err) => console.error("Error fetching owners:", err),
  });

  const owners = useMemo(() => {
    if (!Array.isArray(ownersResponse)) return [];

    return ownersResponse.map((owner) => ({
      id: owner.Owner_id,
      userid: owner.User_FK_ID,
      name: owner.Profile_fullName,
    }));
  }, [ownersResponse]);
  // Reset form when modal opens/closes or when editing a different pet
  useEffect(() => {
    if (!show) return;

    if (pet) {
      setFormData({
        name: pet.name || "",
        species: pet.species || "",
        breed: pet.breed || "",
        owner_id: pet.owner_id?.toString() || "",
        vaccination_card: pet.vaccination_card || null,
        photos: pet.photos || null,
      });
      return;
    }

    if (owners.length > 0) {
      setFormData({
        name: "",
        species: "",
        breed: "",
        owner_id: owners[0].id?.toString() || "",
        vaccination_card: null,
        photos: null,
      });
    }
  }, [show, pet, owners]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleFileUpload = (e, field) => {
    const files = Array.from(e.target.files);

    if (field === "photos") {
      setFormData((prev) => ({ ...prev, photos: files[0] }));
    } else if (field === "vaccination_card") {
      setFormData((prev) => ({ ...prev, vaccination_card: files[0] }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const form = new FormData();
    form.append("name", formData.name);
    form.append("species", formData.species);
    form.append("breed", formData.breed);
    form.append("owner_id", formData.owner_id);

    if (formData.vaccination_card) {
      form.append("vaccination_card", formData.vaccination_card);
    }

    if (formData.photos) {
      form.append("photo", formData.photos); // ¡OJO! tu backend espera "photo", no "photos"
    }

    // Envía el FormData al componente padre
    onSubmit(form);
  };

  if (!show) return null;

  return (
    <div
      className="modal-backdrop"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1050,
      }}
    >
      <div
        className="modal-content"
        style={{
          backgroundColor: "white",
          borderRadius: "5px",
          width: "90%",
          maxWidth: "800px",
          maxHeight: "90vh",
          overflow: "auto",
          position: "relative",
        }}
      >
        <div
          className="modal-header"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "1rem",
            borderBottom: "1px solid #dee2e6",
          }}
        >
          <h5 className="modal-title">
            {pet ? "Editar Mascota" : "Registrar Nueva Mascota"}
          </h5>
          <button
            type="button"
            className="btn-close"
            onClick={onHide}
            aria-label="Close"
            style={{
              background: "transparent",
              border: 0,
              fontSize: "1.5rem",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ padding: "1rem" }}>
            <div className="row">
              <div className="col-md-6">
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">
                    Nombre <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Nombre de la mascota"
                    required
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label htmlFor="owner_id" className="form-label">
                    Propietario <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-select"
                    id="owner_id"
                    name="owner_id"
                    value={formData.owner_id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Seleccione un propietario</option>
                    {owners.map((owner) => (
                      <option key={`${owner.id}`} value={owner.id}>
                        {owner.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <div className="mb-3">
                  <label htmlFor="species" className="form-label">
                    Especie <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="species"
                    name="species"
                    value={formData.species}
                    onChange={handleChange}
                    placeholder="Ej: Perro, Gato, Ave"
                    required
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label htmlFor="breed" className="form-label">
                    Raza
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="breed"
                    name="breed"
                    value={formData.breed}
                    onChange={handleChange}
                    placeholder="Raza de la mascota"
                  />
                </div>
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="vaccination_card" className="form-label">
                Tarjeta de vacunación
              </label>
              <input
                type="file"
                className="form-control"
                id="vaccination_card"
                accept="pdf/*"
                onChange={(e) => handleFileUpload(e, "vaccination_card")}
              />
              {formData.vaccination_card && (
                <div className="mt-2">
                  <small className="text-muted">
                    Archivo seleccionado: {formData.vaccination_card.name}
                  </small>
                </div>
              )}
            </div>

            <div className="mb-3">
              <label htmlFor="photos" className="form-label">
                Fotos
              </label>
              <input
                type="file"
                className="form-control"
                id="photos"
                accept="image/*"
                multiple
                onChange={(e) => handleFileUpload(e, "photos")}
              />
              {formData.photos && (
                <div className="mt-2">
                  <small className="text-muted">
                    Archivo seleccionado: {formData.photos.name}
                  </small>
                </div>
              )}
            </div>
          </div>
          <div
            className="modal-footer"
            style={{
              display: "flex",
              justifyContent: "flex-end",
              padding: "1rem",
              borderTop: "1px solid #dee2e6",
            }}
          >
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onHide}
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  {pet ? "Actualizando..." : "Registrando..."}
                </>
              ) : pet ? (
                "Actualizar"
              ) : (
                "Registrar"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PetModal;
