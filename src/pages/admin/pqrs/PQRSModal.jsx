import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { pqrsAPI, ownersAPI } from '../../../services/api';
import toast from 'react-hot-toast';
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

  // Mutations
  const createMutation = useMutation(pqrsAPI.create, {
    onSuccess: () => {
      queryClient.invalidateQueries('pqrs');
      toast.success('PQRS creado exitosamente');
      onSave && onSave();
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || error.response?.data?.message || 'Error al crear PQRS');
    }
  });

  const updateMutation = useMutation(
    ({ id, data }) => pqrsAPI.update(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('pqrs');
        toast.success('PQRS actualizado exitosamente');
        onSave && onSave();
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || error.response?.data?.message || 'Error al actualizar PQRS');
      }
    }
  );

  // Admin response mutation
  const respondMutation = useMutation(
    ({ id, data }) => pqrsAPI.updateStatus(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('pqrs');
        toast.success('Respuesta enviada exitosamente');
        setShowResponseForm(false);
        setAdminResponse('');
        // Keep modal open to show the updated response
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || error.response?.data?.message || 'Error al enviar respuesta');
      }
    }
  );

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

  return (
    <Modal 
      show={show} 
      onHide={onClose} 
      size="lg" 
      centered
      backdrop="static"
      keyboard={false}
      dialogClassName="custom-modal-dialog"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <Modal.Header closeButton>
        <Modal.Title>{getModalTitle()}</Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        {mode === 'view' ? (
          <div className="pqrs-details">
            <div className="row mb-3">
              <div className="col-md-6">
                <p><strong>ID:</strong> {pqrs.PQRS_id}</p>
                <p><strong>Asunto:</strong> {pqrs.PQRS_subject}</p>
                <p><strong>Categoría:</strong> {findCategoryById(pqrs.PQRS_category_FK_ID)}</p>
                <p><strong>Propietario:</strong> {pqrs.owner_name || findOwnerById(pqrs.Owner_FK_ID)}</p>
                <p><strong>Prioridad:</strong> 
                  <span className={`badge ms-2 ${
                    pqrs.PQRS_priority === 'HIGH' ? 'bg-danger' :
                    pqrs.PQRS_priority === 'MEDIUM' ? 'bg-warning' : 'bg-info'
                  }`}>
                    {pqrs.PQRS_priority}
                  </span>
                </p>
              </div>
              <div className="col-md-6">
                <p><strong>Estado:</strong> 
                  <span className={`badge ms-2 ${
                    pqrs.current_status_id === 1 ? 'bg-warning' :
                    pqrs.current_status_id === 2 ? 'bg-primary' :
                    pqrs.current_status_id === 3 ? 'bg-success' : 'bg-secondary'
                  }`}>
                    {getStatusName(pqrs.current_status_id)}
                  </span>
                </p>
                <p><strong>Fecha de creación:</strong> {new Date(pqrs.PQRS_createdAt).toLocaleDateString()}</p>
                {pqrs.PQRS_updatedAt && (
                  <p><strong>Última actualización:</strong> {new Date(pqrs.PQRS_updatedAt).toLocaleDateString()}</p>
                )}
              </div>
            </div>
            
            <div className="mb-3">
              <h5>Descripción:</h5>
              <div className="p-3 bg-light rounded">
                {pqrs.PQRS_description}
              </div>
            </div>
            
            {/* Attachments */}
            {pqrs.PQRS_file && (
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
            
            {/* Admin Response Section */}
            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h5>Respuesta del administrador:</h5>
                {!pqrs.PQRS_answer && !showResponseForm && (
                  <Button 
                    variant="outline-primary" 
                    size="sm" 
                    onClick={toggleResponseForm}
                    disabled={loading}
                  >
                    <i className="bi bi-reply me-2"></i>
                    Responder
                  </Button>
                )}
              </div>
              
              {pqrs.PQRS_answer ? (
                <div className="p-3 bg-light rounded">
                  {pqrs.PQRS_answer}
                </div>
              ) : showResponseForm ? (
                <div className="border rounded p-3">
                  <Form.Group className="mb-3">
                    <Form.Label>Escribir respuesta:</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      value={adminResponse}
                      onChange={(e) => setAdminResponse(e.target.value)}
                      placeholder="Escriba su respuesta al PQRS..."
                      disabled={loading}
                    />
                  </Form.Group>
                  <div className="d-flex gap-2">
                    <Button 
                      variant="primary" 
                      onClick={handleAdminResponse}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Enviando...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-send me-2"></i>
                          Enviar Respuesta
                        </>
                      )}
                    </Button>
                    <Button 
                      variant="secondary" 
                      onClick={toggleResponseForm}
                      disabled={loading}
                    >
                      Cancelar
                    </Button>
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
        ) : (
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Form.Group className="mb-3">
              <Form.Label>Asunto *</Form.Label>
              <Form.Control
                type="text"
                {...register('subject', { required: 'El asunto es requerido' })}
                isInvalid={!!errors.subject}
                disabled={loading}
              />
              {errors.subject && (
                <Form.Control.Feedback type="invalid">
                  {errors.subject.message}
                </Form.Control.Feedback>
              )}
            </Form.Group>

            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Categoría *</Form.Label>
                  <Form.Select
                    {...register('category_id', { required: 'La categoría es requerida' })}
                    isInvalid={!!errors.category_id}
                    disabled={loading}
                  >
                    <option value="">Seleccione una categoría</option>
                    {Array.isArray(categories) && categories.length > 0 ? (
                      categories.map(category => (
                        <option key={`category-${category.id || category.PQRS_category_id}`} value={(category.id || category.PQRS_category_id).toString()}>
                          {category.name || category.PQRS_category_name}
                        </option>
                      ))
                    ) : (
                      // Fallback categories if none are loaded
                      <>
                        <option value="1">Quejas</option>
                        <option value="2">Peticiones</option>
                        <option value="3">Reclamos</option>
                        <option value="4">Sugerencias</option>
                      </>
                    )}
                  </Form.Select>
                  {errors.category_id && (
                    <Form.Control.Feedback type="invalid">
                      {errors.category_id.message}
                    </Form.Control.Feedback>
                  )}
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Propietario *</Form.Label>
                  <Form.Select
                    {...register('owner_id', { required: 'El propietario es requerido' })}
                    isInvalid={!!errors.owner_id}
                    disabled={loading}
                  >
                    <option value="">Seleccione un propietario</option>
                    {Array.isArray(owners) && owners.length > 0 ? (
                      owners.map(owner => (
                        <option key={`owner-${owner.id || owner.Owner_id}`} value={(owner.id || owner.Owner_id).toString()}>
                          {owner.Profile_fullName || 
                           owner.name || 
                           (owner.first_name && owner.last_name ? 
                             `${owner.first_name} ${owner.last_name}` : 
                             `ID: ${owner.id || owner.Owner_id}`)}
                        </option>
                      ))
                    ) : (
                      // Show loading or error message
                      <option value="" disabled>
                        {ownersLoading ? 'Cargando propietarios...' : 
                         ownersError ? 'Error cargando propietarios' : 
                         'No hay propietarios disponibles'}
                      </option>
                    )}
                  </Form.Select>
                  {errors.owner_id && (
                    <Form.Control.Feedback type="invalid">
                      {errors.owner_id.message}
                    </Form.Control.Feedback>
                  )}
                </Form.Group>
              </div>
            </div>

            <Form.Group className="mb-3">
              <Form.Label>Prioridad</Form.Label>
              <Form.Select {...register('priority')} disabled={loading}>
                <option value="LOW">Baja</option>
                <option value="MEDIUM">Media</option>
                <option value="HIGH">Alta</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Descripción *</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                {...register('description', { required: 'La descripción es requerida' })}
                isInvalid={!!errors.description}
                disabled={loading}
              />
              {errors.description && (
                <Form.Control.Feedback type="invalid">
                  {errors.description.message}
                </Form.Control.Feedback>
              )}
            </Form.Group>

            {/* File Upload - Only for new PQRS */}
            {mode === 'create' && (
              <Form.Group className="mb-3">
                <Form.Label>Archivos adjuntos</Form.Label>
                <Form.Control
                  type="file"
                  multiple
                  accept="image/*,.pdf,.txt"
                  onChange={handleFileChange}
                  disabled={loading}
                />
                <Form.Text className="text-muted">
                  Máximo 5 archivos. Tipos permitidos: imágenes, PDF, archivos de texto. Tamaño máximo: 5MB por archivo.
                </Form.Text>
                
                {/* Selected files preview */}
                {selectedFiles.length > 0 && (
                  <div className="mt-2">
                    <small className="text-muted">Archivos seleccionados:</small>
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="d-flex justify-content-between align-items-center mt-1 p-2 bg-light rounded">
                        <span>
                          <i className={`bi ${getFileIcon(file.name)} me-2`}></i>
                          {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => removeFile(index)}
                          disabled={loading}
                        >
                          <i className="bi bi-x"></i>
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </Form.Group>
            )}

            {/* Update notice for existing PQRS */}
            {mode === 'edit' && (
              <Alert variant="info">
                <i className="bi bi-info-circle me-2"></i>
                Los archivos adjuntos no se pueden modificar al editar un PQRS existente.
              </Alert>
            )}
          </Form>
        )}
      </Modal.Body>
      
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose} disabled={loading}>
          Cerrar
        </Button>
        
        {mode !== 'view' && (
          <Button 
            variant="primary" 
            onClick={handleSubmit(onSubmit)}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                {mode === 'create' ? 'Creando...' : 'Guardando...'}
              </>
            ) : (
              <>
                <i className={`bi ${mode === 'create' ? 'bi-plus' : 'bi-check'} me-2`}></i>
                {mode === 'create' ? 'Crear PQRS' : 'Guardar Cambios'}
              </>
            )}
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default PQRSModal; 