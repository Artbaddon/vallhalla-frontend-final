import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import Modal from "react-modal";
import "./PaymentModal.css";

const PaymentModal = ({
  show,
  onHide,
  onSubmit,
  payment,
  isLoading,
  owners,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    watch,
  } = useForm();

  useEffect(() => {
    setIsOpen(show);

    if (show && payment) {
      setValue("owner_id", payment.owner_id || "");
      setValue("amount", payment.amount || "");
      setValue("payment_type", payment.payment_type || "MAINTENANCE");
      setValue("description", payment.description || "");
    } else if (show) {
      reset();
      setValue("payment_type", "MAINTENANCE");
    }
  }, [show, payment, setValue, reset]);

  const handleClose = () => {
    setIsOpen(false);
    reset();
    onHide();
  };

  const onSubmitForm = (data) => {
    const submitData = {
      ...data,
      owner_id: data.owner_id === "all" ? "all" : parseInt(data.owner_id),
      amount: parseFloat(data.amount),
    };
    onSubmit(submitData);
  };

  const paymentTypes = [
    { value: "MAINTENANCE", label: "Mantenimiento" },
    { value: "ADMINISTRATION", label: "Administración" },
    { value: "PARKING", label: "Parqueadero" },
    { value: "FINE", label: "Multa" },
    { value: "EXTRAORDINARY", label: "Extraordinario" },
    { value: "UTILITIES", label: "Servicios Públicos" },
  ];

  const ownerOptions = [
    { value: "all", label: "TODOS LOS PROPIETARIOS" },
    ...(owners || []).map((owner) => ({
      value: owner.Owner_id || owner.id,
      label:
        `${owner.Owner_first_name || owner.firstName || ""} ${
          owner.Owner_last_name || owner.lastName || ""
        }`.trim() || `Propietario #${owner.Owner_id || owner.id}`,
    })),
  ];

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleClose}
      className="payment-modal"
      overlayClassName="modal-overlay"
      contentLabel={payment ? "Editar Pago" : "Nuevo Pago"}
    >
      <div className="modal-header">
        <h5 className="modal-title">
          {payment ? "Editar Pago" : "Registrar Pago"}
        </h5>
        <button
          type="button"
          className="btn-close"
          onClick={handleClose}
          aria-label="Close"
        ></button>
      </div>

      <form onSubmit={handleSubmit(onSubmitForm)}>
        <div className="modal-body">
          <div className="mb-3">
            <label htmlFor="owner_id" className="form-label">
              Propietario <span className="text-danger">*</span>
            </label>
            <select
              id="owner_id"
              className={`form-select ${errors.owner_id ? "is-invalid" : ""}`}
              {...register("owner_id", {
                required: "El propietario es requerido",
              })}
            >
              <option value="">Seleccionar propietario...</option>
              {ownerOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.owner_id && (
              <div className="invalid-feedback">{errors.owner_id.message}</div>
            )}
          </div>

          <div className="mb-3">
            <label htmlFor="amount" className="form-label">
              Monto <span className="text-danger">*</span>
            </label>
            <input
              type="number"
              id="amount"
              className={`form-control ${errors.amount ? "is-invalid" : ""}`}
              placeholder="0.00"
              step="0.01"
              {...register("amount", {
                required: "El monto es requerido",
                min: { value: 0.01, message: "El monto debe ser mayor a 0" },
              })}
            />
            {errors.amount && (
              <div className="invalid-feedback">{errors.amount.message}</div>
            )}
          </div>

          <div className="mb-3">
            <label htmlFor="payment_type" className="form-label">
              Tipo de Pago
            </label>
            <select
              id="payment_type"
              className="form-select"
              {...register("payment_type")}
            >
              {paymentTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label htmlFor="description" className="form-label">
              Descripción <span className="text-danger">*</span>
            </label>
            <textarea
              id="description"
              className={`form-control ${
                errors.description ? "is-invalid" : ""
              }`}
              rows="3"
              placeholder="Descripción del pago..."
              {...register("description", {
                required: "La descripción es requerida",
                minLength: {
                  value: 10,
                  message: "La descripción debe tener al menos 10 caracteres",
                },
              })}
            />
            {errors.description && (
              <div className="invalid-feedback">
                {errors.description.message}
              </div>
            )}
          </div>

          {/* Mostrar alerta si es para todos */}
          {watch("owner_id") === "all" && (
            <div className="alert alert-info">
              <i className="bi bi-info-circle me-2"></i>
              Se creará un pago para todos los propietarios (
              {owners?.length || 0})
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleClose}
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
                Guardando...
              </>
            ) : payment ? (
              "Actualizar"
            ) : (
              "Registrar"
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default PaymentModal;
