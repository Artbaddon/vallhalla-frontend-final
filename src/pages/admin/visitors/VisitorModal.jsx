import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { ownersAPI } from '../../../services/api';
import './VisitorModal.css';

const VisitorModal = ({ isOpen, onClose, onSubmit, visitor }) => {
  const [formData, setFormData] = useState({
    name: '',
    documentNumber: '',
    hostId: '',
    enterDate: new Date().toISOString().split('T')[0]
  });

  // Fetch owners with details for the dropdown
  const { 
    data: ownersData, 
    isLoading: loadingOwners 
  } = useQuery('owners', ownersAPI.getDetails, {
    onSuccess: (data) => {
      console.log('Owners response:', data);
    },
    onError: (error) => {
      console.error('Error fetching owners:', error);
    }
  });

  // Safely extract owners array
  const owners = React.useMemo(() => {
    if (!ownersData) return [];
    
    // If ownersData is already an array
    if (Array.isArray(ownersData)) {
      return ownersData;
    }
    
    // If ownersData has owners property
    if (ownersData.owners && Array.isArray(ownersData.owners)) {
      return ownersData.owners;
    }
    
    console.warn('Unexpected owners response structure:', ownersData);
    return [];
  }, [ownersData]);

  console.log('Processed owners:', owners);
  // Debug: Log the first owner to see available properties
  if (owners.length > 0) {
    console.log('First owner properties:', Object.keys(owners[0]));
    console.log('First owner data:', owners[0]);
  }

  useEffect(() => {
    if (visitor) {
      setFormData({
        name: visitor.name || '',
        documentNumber: visitor.documentNumber || '',
        hostId: visitor.hostId || '',
        enterDate: visitor.enterDate ? visitor.enterDate.split('T')[0] : new Date().toISOString().split('T')[0]
      });
    } else {
      setFormData({
        name: '',
        documentNumber: '',
        hostId: '',
        enterDate: new Date().toISOString().split('T')[0]
      });
    }
  }, [visitor, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!visitor?.isViewOnly) {
      onSubmit(formData);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  if (!isOpen) return null;

  const isViewOnly = visitor?.isViewOnly || false;
  const modalTitle = isViewOnly ? 'Ver Visitante' : (visitor ? 'Editar Visitante' : 'Registrar Visitante');

  return (
    <div className="modal-overlay" onClick={handleBackdropClick}>
      <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
        <div className="modal-dialog modal-xl">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {modalTitle}
              </h5>
              <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label htmlFor="name" className="form-label">Nombre</label>
                      <input
                        type="text"
                        className="form-control"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Ingrese el nombre del visitante"
                        required={!isViewOnly}
                        disabled={isViewOnly}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label htmlFor="documentNumber" className="form-label">Número de Documento</label>
                      <input
                        type="text"
                        className="form-control"
                        id="documentNumber"
                        name="documentNumber"
                        value={formData.documentNumber}
                        onChange={handleInputChange}
                        placeholder="Ingrese el número de documento"
                        required={!isViewOnly}
                        disabled={isViewOnly}
                      />
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label htmlFor="hostId" className="form-label">Anfitrión</label>
                      {isViewOnly ? (
                        <input
                          type="text"
                          className="form-control"
                          value={visitor.hostName || `ID: ${visitor.hostId}`}
                          disabled
                        />
                      ) : (
                        <select
                          className="form-select"
                          id="hostId"
                          name="hostId"
                          value={formData.hostId}
                          onChange={handleInputChange}
                          required
                          disabled={loadingOwners}
                        >
                          <option value="">Seleccione un anfitrión</option>
                          {loadingOwners ? (
                            <option value="" disabled>Cargando anfitriones...</option>
                          ) : (
                            Array.isArray(owners) && owners.map((owner, index) => (
                              <option key={`owner-${owner.Owner_id}-${index}`} value={owner.Owner_id}>
                                {owner.Profile_fullName || owner.Users_name || `Owner ${owner.Owner_id}`}
                                {owner.Profile_document_number ? ` - ${owner.Profile_document_number}` : ''}
                              </option>
                            ))
                          )}
                        </select>
                      )}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label htmlFor="enterDate" className="form-label">Fecha de Entrada</label>
                      <input
                        type={isViewOnly ? "text" : "date"}
                        className="form-control"
                        id="enterDate"
                        name="enterDate"
                        value={isViewOnly ? formatDate(visitor.enterDate) : formData.enterDate}
                        onChange={handleInputChange}
                        required={!isViewOnly}
                        disabled={isViewOnly}
                      />
                    </div>
                  </div>
                </div>

                {isViewOnly && visitor.exitDate && (
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Fecha de Salida</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formatDate(visitor.exitDate)}
                          disabled
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Estado</label>
                        <input
                          type="text"
                          className="form-control"
                          value={visitor.exitDate ? "Ha salido" : "Aún presente"}
                          disabled
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={onClose}>
                  {isViewOnly ? 'Cerrar' : 'Cancelar'}
                </button>
                {!isViewOnly && (
                  <button type="submit" className="btn btn-primary">
                    {visitor && !visitor.isViewOnly ? 'Actualizar' : 'Registrar'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show"></div>
    </div>
  );
};

export default VisitorModal; 