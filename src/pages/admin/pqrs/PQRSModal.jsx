import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useQueryClient } from 'react-query';
import { pqrsAPI, ownersAPI } from '../../../services/api';
import toast from 'react-hot-toast';
import { DynamicModal } from '../../../components/common';
import './PQRS.css';

const PQRSModal = ({ show, mode = 'create', pqrs, categories, onClose, onSave }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const queryClient = useQueryClient();
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [showResponseForm, setShowResponseForm] = useState(false);
  const [adminResponse, setAdminResponse] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch owners for dropdown
  const { data: ownersResponse = [], isLoading: ownersLoading, error: ownersError } = useQuery('owners', ownersAPI.getDetails);
  
  // Extract owners data safely, handling different API response structures from getDetails
  const extractOwners = () => {
    console.log('Raw owners response from getDetails:', ownersResponse);
    
    if (!ownersResponse) {
      console.log('No owners response, returning fallback data');
      return [
        { Owner_id: 1, Profile_fullName: 'Juan Pérez', first_name: 'Juan', last_name: 'Pérez' },
        { Owner_id: 2, Profile_fullName: 'María García', first_name: 'María', last_name: 'García' },
        { Owner_id: 3, Profile_fullName: 'Carlos López', first_name: 'Carlos', last_name: 'López' }
      ];
    }
    
    // Handle different response structures from getDetails
    if (Array.isArray(ownersResponse)) {
      console.log('Direct array response:', ownersResponse);
      return ownersResponse;
    }
    
    if (ownersResponse.owners && Array.isArray(ownersResponse.owners)) {
      console.log('Response.owners array:', ownersResponse.owners);
      return ownersResponse.owners;
    }
    
    if (ownersResponse.data && Array.isArray(ownersResponse.data)) {
      console.log('Response.data array:', ownersResponse.data);
      return ownersResponse.data;
    }
    
    if (ownersResponse.data && ownersResponse.data.owners && Array.isArray(ownersResponse.data.owners)) {
      console.log('Response.data.owners array:', ownersResponse.data.owners);
      return ownersResponse.data.owners;
    }
    
    console.log('No valid owners structure found, returning fallback data');
    return [
      { Owner_id: 1, Profile_fullName: 'Juan Pérez', first_name: 'Juan', last_name: 'Pérez' },
      { Owner_id: 2, Profile_fullName: 'María García', first_name: 'María', last_name: 'García' },
      { Owner_id: 3, Profile_fullName: 'Carlos López', first_name: 'Carlos', last_name: 'López' }
    ];
  };
  
  const owners = extractOwners();
  
  // Debug logging
  console.log('Owners loading:', ownersLoading);
  console.log('Owners error:', ownersError);
  console.log('Final owners array:', owners);

  // Reset form when modal opens/closes or pqrs changes
  useEffect(() => {
    if (show) {
      if (pqrs && (mode === 'edit' || mode === 'view')) {
        // Map backend field names to form fields
        reset({
          subject: pqrs.PQRS_subject || '',
          category_id: pqrs.PQRS_category_FK_ID?.toString() || '',
          owner_id: pqrs.Owner_FK_ID?.toString() || '',
          description: pqrs.PQRS_description || '',
          priority: pqrs.PQRS_priority || 'MEDIUM'
        });
      } else {
        // If creating new PQRS, reset form
        reset({
          subject: '',
          category_id: '',
          owner_id: '',
          description: '',
          priority: 'MEDIUM'
        });
      }
      setSelectedFiles([]);
      setShowResponseForm(false);
      setAdminResponse('');
    }
  }, [show, pqrs, mode, reset]);

  // Handle file selection
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate file types
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain'];
    const invalidFiles = files.filter(file => !allowedTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      toast.error('Tipo de archivo no permitido. Solo se permiten imágenes, PDFs y archivos de texto.');
      return;
    }
    
    // Validate file size (5MB max)
    const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast.error('El tamaño del archivo no debe exceder 5MB.');
      return;
    }
    
    // Limit to 5 files
    if (files.length > 5) {
      toast.error('Máximo 5 archivos permitidos.');
      return;
    }
    
    setSelectedFiles(files);
  };

  // Remove selected file
  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      if (mode === 'create') {
        // Create FormData for multipart form submission
        const formData = new FormData();
        
        // Add form fields
        formData.append('subject', data.subject);
        formData.append('category_id', data.category_id);
        formData.append('owner_id', data.owner_id);
        formData.append('description', data.description);
        formData.append('priority', data.priority);
        
        // Add files if any
        selectedFiles.forEach(file => {
          formData.append('attachments', file);
        });

  await pqrsAPI.create(formData);
  queryClient.invalidateQueries('pqrs');
        toast.success('PQRS creado exitosamente');
      } else if (mode === 'edit') {
        // For updates, we don't send files (would need separate endpoint)
        const updateData = {
          subject: data.subject,
          category_id: parseInt(data.category_id),
          owner_id: parseInt(data.owner_id),
          description: data.description,
          priority: data.priority
        };
        
  await pqrsAPI.update(pqrs.PQRS_id, updateData);
  queryClient.invalidateQueries('pqrs');
        toast.success('PQRS actualizado exitosamente');
      }

      onSave && onSave();
    } catch (error) {
      console.error('Error saving PQRS:', error);
      toast.error(error.response?.data?.error || error.response?.data?.message || 'Error al guardar PQRS');
    } finally {
      setLoading(false);
    }
  };

  // Handle admin response
  const handleAdminResponse = async () => {
    if (!adminResponse.trim()) {
      toast.error('Por favor ingrese una respuesta');
      return;
    }

    try {
      setLoading(true);
      await pqrsAPI.updateStatus(pqrs.PQRS_id, {
        status_id: 2, // Set to "En proceso" when responding
        admin_response: adminResponse.trim()
      });
      queryClient.invalidateQueries('pqrs');
      
      toast.success('Respuesta enviada exitosamente');
      setShowResponseForm(false);
      setAdminResponse('');
      onSave && onSave(); // Refresh data
    } catch (error) {
      console.error('Error sending response:', error);
      toast.error(error.response?.data?.error || error.response?.data?.message || 'Error al enviar respuesta');
    } finally {
      setLoading(false);
    }
  };

  const toggleResponseForm = () => {
    setShowResponseForm(!showResponseForm);
    if (!showResponseForm) {
      setAdminResponse('');
    }
  };

  // Get status name
  const getStatusName = (statusId) => {
    const statuses = {
      1: 'Pendiente',
      2: 'En proceso',
      3: 'Resuelto',
      4: 'Cerrado'
    };
    return statuses[statusId] || 'Sin estado';
  };

  // Helper function to find owner by ID
  const findOwnerById = (ownerId) => {
    const owner = owners.find(o => (o.id || o.Owner_id) === ownerId);
    if (owner) {
      return owner.name || owner.first_name && owner.last_name ? 
        `${owner.first_name} ${owner.last_name}` : 
        `ID: ${ownerId}`;
    }
    return `ID: ${ownerId}`;
  };

  // Helper function to find category by ID
  const findCategoryById = (categoryId) => {
    const category = categories.find(c => 
      (c.id || c.PQRS_category_id) === categoryId
    );
    return category ? (category.name || category.PQRS_category_name) : 'Sin categoría';
  };

  // Parse attachments from PQRS_file field
  const getAttachments = () => {
    if (!pqrs || !pqrs.PQRS_file) return [];
    
    return pqrs.PQRS_file.split(',').map(filename => ({
      filename: filename.trim(),
      url: `/uploads/pqrs/${filename.trim()}`,
      originalname: filename.trim()
    }));
  };

  // Get file icon based on file type
  const getFileIcon = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    switch (ext) {
      case 'pdf':
        return 'bi-file-pdf';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return 'bi-file-image';
      case 'txt':
        return 'bi-file-text';
      default:
        return 'bi-file-earmark';
    }
  };

  const getModalTitle = () => {
    switch (mode) {
      case 'create':
        return 'Crear Nuevo PQRS';
      case 'edit':
        return 'Editar PQRS';
      case 'view':
        return 'Detalles de PQRS';
      default:
        return 'PQRS';
    }
  };

    const renderViewMode = () => {
      const safePQRS = pqrs || {};

      return (
        <div className="pqrs-details">
          <div className="row mb-3">
            <div className="col-md-6">
              <p><strong>ID:</strong> {safePQRS.PQRS_id ?? 'N/A'}</p>
              <p><strong>Asunto:</strong> {safePQRS.PQRS_subject ?? 'N/A'}</p>
              <p><strong>Categoría:</strong> {findCategoryById(safePQRS.PQRS_category_FK_ID)}</p>
              <p><strong>Propietario:</strong> {safePQRS.owner_name || findOwnerById(safePQRS.Owner_FK_ID)}</p>
              <p>
                <strong>Prioridad:</strong>
                <span
                  className={`badge ms-2 ${
                    safePQRS.PQRS_priority === 'HIGH'
                      ? 'bg-danger'
                      : safePQRS.PQRS_priority === 'MEDIUM'
                      ? 'bg-warning'
                      : 'bg-info'
                  }`}
                >
                  {safePQRS.PQRS_priority ?? 'N/A'}
                </span>
              </p>
            </div>
            <div className="col-md-6">
              <p>
                <strong>Estado:</strong>
                <span
                  className={`badge ms-2 ${
                    safePQRS.current_status_id === 1
                      ? 'bg-warning'
                      : safePQRS.current_status_id === 2
                      ? 'bg-primary'
                      : safePQRS.current_status_id === 3
                      ? 'bg-success'
                      : 'bg-secondary'
                  }`}
                >
                  {getStatusName(safePQRS.current_status_id)}
                </span>
              </p>
              <p>
                <strong>Fecha de creación:</strong>{' '}
                {safePQRS.PQRS_createdAt
                  ? new Date(safePQRS.PQRS_createdAt).toLocaleDateString()
                  : 'N/A'}
              </p>
              {safePQRS.PQRS_updatedAt && (
                <p>
                  <strong>Última actualización:</strong>{' '}
                  {new Date(safePQRS.PQRS_updatedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>

          <div className="mb-3">
            <h5>Descripción:</h5>
            <div className="p-3 bg-light rounded">
              {safePQRS.PQRS_description || 'Sin descripción'}
            </div>
          </div>

          {safePQRS.PQRS_file && (
            <div className="mb-3">
              <h5>Archivos adjuntos:</h5>
              <div className="row">
                {getAttachments().map((attachment, index) => (
                  <div key={index} className="col-md-4 mb-2">
                    <div className="card">
                      <div className="card-body d-flex align-items-center">
                        <i className={`bi ${getFileIcon(attachment.filename)} me-2`}></i>
                        <div className="flex-grow-1">
                          <small className="text-muted">{attachment.originalname}</small>
                        </div>
                        <a
                          href={attachment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-sm btn-outline-primary"
                        >
                          <i className="bi bi-download"></i>
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mb-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h5>Respuesta del administrador:</h5>
              {!safePQRS.PQRS_answer && !showResponseForm && (
                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm"
                  onClick={toggleResponseForm}
                  disabled={loading}
                >
                  <i className="bi bi-reply me-2"></i>
                  Responder
                </button>
              )}
            </div>

            {safePQRS.PQRS_answer ? (
              <div className="p-3 bg-light rounded">{safePQRS.PQRS_answer}</div>
            ) : showResponseForm ? (
              <div className="border rounded p-3">
                <div className="mb-3">
                  <label className="form-label" htmlFor="admin-response-textarea">
                    Escribir respuesta:
                  </label>
                  <textarea
                    id="admin-response-textarea"
                    className="form-control"
                    rows={4}
                    value={adminResponse}
                    onChange={(e) => setAdminResponse(e.target.value)}
                    placeholder="Escriba su respuesta al PQRS..."
                    disabled={loading}
                  />
                </div>
                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleAdminResponse}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Enviando...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-send me-2"></i>
                        Enviar Respuesta
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={toggleResponseForm}
                    disabled={loading}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-light rounded text-muted">
                <i className="bi bi-info-circle me-2"></i>
                No hay respuesta del administrador
              </div>
            )}
          </div>
        </div>
      );
    };

    const renderFormMode = () => (
      <>
        <div className="mb-3">
          <label htmlFor="pqrs-subject" className="form-label">
            Asunto *
          </label>
          <input
            id="pqrs-subject"
            type="text"
            className={`form-control${errors.subject ? ' is-invalid' : ''}`}
            {...register('subject', { required: 'El asunto es requerido' })}
            disabled={loading}
          />
          {errors.subject && (
            <div className="invalid-feedback">{errors.subject.message}</div>
          )}
        </div>

        <div className="row">
          <div className="col-md-6">
            <div className="mb-3">
              <label htmlFor="pqrs-category" className="form-label">
                Categoría *
              </label>
              <select
                id="pqrs-category"
                className={`form-select${errors.category_id ? ' is-invalid' : ''}`}
                {...register('category_id', { required: 'La categoría es requerida' })}
                disabled={loading}
              >
                <option value="">Seleccione una categoría</option>
                {Array.isArray(categories) && categories.length > 0 ? (
                  categories.map((category) => (
                    <option
                      key={`category-${category.id || category.PQRS_category_id}`}
                      value={(category.id || category.PQRS_category_id).toString()}
                    >
                      {category.name || category.PQRS_category_name}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="1">Quejas</option>
                    <option value="2">Peticiones</option>
                    <option value="3">Reclamos</option>
                    <option value="4">Sugerencias</option>
                  </>
                )}
              </select>
              {errors.category_id && (
                <div className="invalid-feedback">{errors.category_id.message}</div>
              )}
            </div>
          </div>
          <div className="col-md-6">
            <div className="mb-3">
              <label htmlFor="pqrs-owner" className="form-label">
                Propietario *
              </label>
              <select
                id="pqrs-owner"
                className={`form-select${errors.owner_id ? ' is-invalid' : ''}`}
                {...register('owner_id', { required: 'El propietario es requerido' })}
                disabled={loading}
              >
                <option value="">Seleccione un propietario</option>
                {Array.isArray(owners) && owners.length > 0 ? (
                  owners.map((owner) => (
                    <option
                      key={`owner-${owner.id || owner.Owner_id}`}
                      value={(owner.id || owner.Owner_id).toString()}
                    >
                      {owner.Profile_fullName ||
                        owner.name ||
                        (owner.first_name && owner.last_name
                          ? `${owner.first_name} ${owner.last_name}`
                          : `ID: ${owner.id || owner.Owner_id}`)}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>
                    {ownersLoading
                      ? 'Cargando propietarios...'
                      : ownersError
                      ? 'Error cargando propietarios'
                      : 'No hay propietarios disponibles'}
                  </option>
                )}
              </select>
              {errors.owner_id && (
                <div className="invalid-feedback">{errors.owner_id.message}</div>
              )}
            </div>
          </div>
        </div>

        <div className="mb-3">
          <label htmlFor="pqrs-priority" className="form-label">
            Prioridad
          </label>
          <select
            id="pqrs-priority"
            className="form-select"
            {...register('priority')}
            disabled={loading}
          >
            <option value="LOW">Baja</option>
            <option value="MEDIUM">Media</option>
            <option value="HIGH">Alta</option>
          </select>
        </div>

        <div className="mb-3">
          <label htmlFor="pqrs-description" className="form-label">
            Descripción *
          </label>
          <textarea
            id="pqrs-description"
            className={`form-control${errors.description ? ' is-invalid' : ''}`}
            rows={4}
            {...register('description', { required: 'La descripción es requerida' })}
            disabled={loading}
          ></textarea>
          {errors.description && (
            <div className="invalid-feedback">{errors.description.message}</div>
          )}
        </div>

        {mode === 'create' && (
          <div className="mb-3">
            <label htmlFor="pqrs-attachments" className="form-label">
              Archivos adjuntos
            </label>
            <input
              id="pqrs-attachments"
              type="file"
              multiple
              accept="image/*,.pdf,.txt"
              className="form-control"
              onChange={handleFileChange}
              disabled={loading}
            />
            <div className="form-text text-muted">
              Máximo 5 archivos. Tipos permitidos: imágenes, PDF, archivos de texto. Tamaño máximo: 5MB por archivo.
            </div>
            {selectedFiles.length > 0 && (
              <div className="mt-2">
                <small className="text-muted">Archivos seleccionados:</small>
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="d-flex justify-content-between align-items-center mt-1 p-2 bg-light rounded"
                  >
                    <span>
                      <i className={`bi ${getFileIcon(file.name)} me-2`}></i>
                      {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                    <button
                      type="button"
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => removeFile(index)}
                      disabled={loading}
                    >
                      <i className="bi bi-x"></i>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {mode === 'edit' && (
          <div className="alert alert-info" role="alert">
            <i className="bi bi-info-circle me-2"></i>
            Los archivos adjuntos no se pueden modificar al editar un PQRS existente.
          </div>
        )}
      </>
    );

    const submitText = mode === 'create'
      ? (loading ? 'Creando...' : 'Crear PQRS')
      : (loading ? 'Guardando...' : 'Guardar Cambios');

    return (
      <DynamicModal
        isOpen={show}
        onClose={onClose}
        title={getModalTitle()}
        size="lg"
        onSubmit={mode === 'view' ? undefined : handleSubmit(onSubmit)}
        submitText={submitText}
        isSubmitting={mode !== 'view' && loading}
        showFooter={mode !== 'view'}
      >
        {mode === 'view' ? renderViewMode() : renderFormMode()}
      </DynamicModal>
    );
};

export default PQRSModal; 