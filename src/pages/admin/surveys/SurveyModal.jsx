import React, { useState, useEffect } from 'react';
import './SurveyModal.css';

const SurveyModal = ({ show, mode, survey, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    status: 'draft',
    questions: []
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Survey statuses (backend expects English values)
  const surveyStatuses = [
    { value: 'draft', label: 'Borrador' },
    { value: 'active', label: 'Activa' },
    { value: 'inactive', label: 'Inactiva' },
    { value: 'closed', label: 'Finalizada' }
  ];

  // Question types
  const questionTypes = [
    { value: 'Pregunta Abierta', label: 'Pregunta Abierta' },
    { value: 'Opción Múltiple', label: 'Opción Múltiple' },
    { value: 'Selección Única', label: 'Selección Única' },
    { value: 'Escala', label: 'Escala de Calificación' }
  ];

  useEffect(() => {
    if (show && survey && (mode === 'edit' || mode === 'view')) {
      setFormData({
        title: survey.title || '',
        description: survey.description || '',
        start_date: survey.start_date ? survey.start_date.split('T')[0] : '',
        end_date: survey.end_date ? survey.end_date.split('T')[0] : '',
        status: survey.status || 'draft',
        questions: survey.questions || []
      });
    } else if (show && mode === 'create') {
      setFormData({
        title: '',
        description: '',
        start_date: '',
        end_date: '',
        status: 'draft',
        questions: [{
          id: Date.now(),
          type: 'Pregunta Abierta',
          text: '',
          options: []
        }]
      });
    }
    setErrors({});
  }, [show, survey, mode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleQuestionChange = (questionId, field, value) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === questionId ? { ...q, [field]: value } : q
      )
    }));
  };

  const addQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      type: 'Pregunta Abierta',
      text: '',
      options: []
    };
    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));
  };

  const removeQuestion = (questionId) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== questionId)
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'El título de la encuesta es requerido';
    }

    if (mode === 'create') {
      if (formData.questions.length === 0) {
        newErrors.questions = 'Debe agregar al menos una pregunta';
      }

      if (formData.questions.length > 0 && !formData.questions[0].text.trim()) {
        newErrors[`question_${formData.questions[0].id}`] = 'La pregunta es requerida';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      if (mode === 'create') {
        // Validate that we have a question with text
        if (!formData.questions || formData.questions.length === 0 || !formData.questions[0]?.text?.trim()) {
          setErrors({ submit: 'Debe agregar al menos una pregunta con texto' });
          return;
        }

        // Backend expects createWithQuestions format
        const submitData = {
          title: formData.title.trim(),
          status: formData.status,
          question: {
            title: formData.questions[0].text.trim(),
            question_type_id: getQuestionTypeId(formData.questions[0].type)
          }
        };
        console.log('Sending survey data:', submitData);
        await onSubmit(submitData);
      } else if (mode === 'edit') {
        // Backend only accepts title and status for updates
        const submitData = {
          title: formData.title.trim(),
          status: formData.status
        };
        await onSubmit(submitData);
      }
    } catch (error) {
      console.error('Error submitting survey:', error);
      setErrors({ submit: 'Error al guardar la encuesta' });
    } finally {
      setLoading(false);
    }
  };

  // Helper function to map question types to IDs
  const getQuestionTypeId = (questionType) => {
    const typeMap = {
      'Pregunta Abierta': 1, // text
      'Opción Múltiple': 3,  // checkbox (multiple answers)
      'Selección Única': 2,  // multiple_choice (single answer)
      'Escala': 4            // rating
    };
    return typeMap[questionType] || 1;
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleEscapeKey = (e) => {
    if (e.key === 'Escape') {
      handleClose();
    }
  };

  useEffect(() => {
    if (show) {
      document.addEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';
    };
  }, [show]);

  if (!show) return null;

  const getTitle = () => {
    switch (mode) {
      case 'create': return 'Crear Nueva Encuesta';
      case 'edit': return 'Editar Encuesta';
      case 'view': return 'Detalles de la Encuesta';
      default: return 'Encuesta';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No especificada';
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'active': { class: 'success', icon: 'check-circle', text: 'Activa' },
      'inactive': { class: 'secondary', icon: 'pause-circle', text: 'Inactiva' },
      'draft': { class: 'warning', icon: 'edit', text: 'Borrador' },
      'closed': { class: 'danger', icon: 'x-circle', text: 'Finalizada' }
    };
    
    const config = statusConfig[status] || { class: 'secondary', icon: 'question-circle', text: status };
    
    return (
      <span className={`badge bg-${config.class}`}>
        <i className={`bi bi-${config.icon} me-1`}></i>
        {config.text}
      </span>
    );
  };

  return (
    <div className="modal-overlay" onClick={handleBackdropClick}>
      <div className="modal-container">
        <div className="modal-header">
          <h2>{getTitle()}</h2>
          <button 
            type="button" 
            className="btn-close" 
            onClick={handleClose}
            disabled={loading}
          >
            <i className="bi bi-x"></i>
          </button>
        </div>

        {mode === 'view' ? (
          <div className="modal-body">
            <div className="survey-preview">
              <div className="survey-header-info">
                <h3>{survey?.title}</h3>
                <p className="survey-description">{survey?.description || 'Encuesta trimestral sobre la satisfacción general de los residentes.'}</p>
              </div>
              
              <div className="survey-questions">
                <div className="question-preview">
                  <div className="question-header">
                    <span className="question-number">Pregunta #1</span>
                    <button className="btn btn-sm btn-outline-primary">
                      <i className="bi bi-pencil me-1"></i>
                      Editar
                    </button>
                  </div>
                  <div className="question-content">
                    <p className="question-text">¿Cómo calificaría el servicio general?</p>
                    <div className="question-input">
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Respuesta"
                        disabled
                      />
                    </div>
                  </div>
                </div>

                <div className="question-preview">
                  <div className="question-header">
                    <span className="question-number">Pregunta #2</span>
                    <button className="btn btn-sm btn-outline-primary">
                      <i className="bi bi-pencil me-1"></i>
                      Editar
                    </button>
                  </div>
                  <div className="question-content">
                    <p className="question-text">¿Qué servicios utiliza con más frecuencia?</p>
                    <div className="question-options">
                      <div className="form-check">
                        <input className="form-check-input" type="checkbox" disabled />
                        <label className="form-check-label">Piscina</label>
                      </div>
                      <div className="form-check">
                        <input className="form-check-input" type="checkbox" disabled />
                        <label className="form-check-label">Gimnasio</label>
                      </div>
                      <div className="form-check">
                        <input className="form-check-input" type="checkbox" disabled />
                        <label className="form-check-label">Parqueadero</label>
                      </div>
                      <div className="form-check">
                        <input className="form-check-input" type="checkbox" disabled />
                        <label className="form-check-label">Seguridad</label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="form-section">
                <div className="form-group">
                  <label htmlFor="title" className="form-label">
                    Título de la encuesta
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Ingrese el título de la encuesta"
                    disabled={loading}
                  />
                  {errors.title && (
                    <div className="invalid-feedback">{errors.title}</div>
                  )}
                </div>

                {mode === 'create' && (
                  <div className="form-group">
                    <label htmlFor="description" className="form-label">
                      Descripción
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Ingrese la descripción de la encuesta"
                      rows={4}
                      disabled={loading}
                    />
                    {errors.description && (
                      <div className="invalid-feedback">{errors.description}</div>
                    )}
                  </div>
                )}

                {mode === 'create' && (
                  <div className="questions-section">
                  <h4>Preguntas</h4>
                  {formData.questions.map((question, index) => (
                    <div key={question.id} className="question-item">
                      <div className="question-header">
                        <h5>Pregunta #{index + 1}</h5>
                        {formData.questions.length > 1 && (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => removeQuestion(question.id)}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        )}
                      </div>
                      
                      <div className="form-group">
                        <label className="form-label">Tipo de pregunta</label>
                        <select
                          className="form-select"
                          value={question.type}
                          onChange={(e) => handleQuestionChange(question.id, 'type', e.target.value)}
                        >
                          {questionTypes.map(type => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Pregunta</label>
                        <textarea
                          className={`form-control ${errors[`question_${question.id}`] ? 'is-invalid' : ''}`}
                          value={question.text}
                          onChange={(e) => handleQuestionChange(question.id, 'text', e.target.value)}
                          placeholder="Escriba su pregunta aquí"
                          rows={3}
                        />
                        {errors[`question_${question.id}`] && (
                          <div className="invalid-feedback">{errors[`question_${question.id}`]}</div>
                        )}
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={addQuestion}
                  >
                    <i className="bi bi-plus-circle me-2"></i>
                    Agregar pregunta
                  </button>

                  {errors.questions && (
                    <div className="alert alert-danger mt-3">
                      {errors.questions}
                    </div>
                  )}
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="status" className="form-label">
                    Estado
                  </label>
                  <select
                    id="status"
                    name="status"
                    className="form-select"
                    value={formData.status}
                    onChange={handleChange}
                    disabled={loading}
                  >
                    {surveyStatuses.map(status => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {errors.submit && (
                <div className="alert alert-danger mt-3">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {errors.submit}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleClose}
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Guardando...
                  </>
                ) : (
                  mode === 'create' ? 'Crear encuesta' : 'Actualizar encuesta'
                )}
              </button>
            </div>
          </form>
        )}

        {mode === 'view' && (
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleClose}
            >
              Cerrar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SurveyModal; 