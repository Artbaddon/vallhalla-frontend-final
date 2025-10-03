import React, { useState, useEffect } from 'react';
import { surveyAPI } from '../../../services/api';
import SurveyModal from './SurveyModal';
import './Surveys.css';

const Surveys = () => {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingSurvey, setEditingSurvey] = useState(null);
  const [modalMode, setModalMode] = useState('create');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await surveyAPI.getAll();
      console.log('Surveys data received:', response);
      setSurveys(response.data || []);
    } catch (err) {
      console.error('Error loading surveys:', err);
      setError('Error al cargar las encuestas');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingSurvey(null);
    setModalMode('create');
    setShowModal(true);
  };

  const handleEdit = (survey) => {
    setEditingSurvey(survey);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleView = (survey) => {
    setEditingSurvey(survey);
    setModalMode('view');
    setShowModal(true);
  };

  const handleDelete = async (survey) => {
    if (window.confirm('¿Está seguro de que desea eliminar esta encuesta?')) {
      try {
        await surveyAPI.delete(survey.survey_id);
        loadData();
      } catch (err) {
        console.error('Error deleting survey:', err);
        alert('Error al eliminar la encuesta');
      }
    }
  };

  const handleFinalize = async (survey) => {
    if (window.confirm('¿Está seguro de que desea finalizar esta encuesta?')) {
      try {
        await surveyAPI.update(survey.survey_id, { 
          title: survey.title,
          status: 'closed' 
        });
        loadData();
      } catch (err) {
        console.error('Error finalizing survey:', err);
        alert('Error al finalizar la encuesta');
      }
    }
  };

  const handleDownloadReport = () => {
    // TODO: Implement report download functionality
    alert('Funcionalidad de descarga de reportes en desarrollo');
  };

  const handleModalSubmit = async (data) => {
    try {
      console.log('Submitting survey data:', data);
      console.log('Modal mode:', modalMode);
      
      if (modalMode === 'create') {
        const result = await surveyAPI.create(data);
        console.log('Survey created successfully:', result);
      } else if (modalMode === 'edit') {
        const result = await surveyAPI.update(editingSurvey.survey_id, data);
        console.log('Survey updated successfully:', result);
      }
      setShowModal(false);
      loadData();
    } catch (err) {
      console.error('Error saving survey:', err);
      console.error('Error details:', err.response?.data);
      console.error('Error status:', err.response?.status);
      throw err;
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingSurvey(null);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'active': { class: 'success', text: 'Activa' },
      'inactive': { class: 'secondary', text: 'Inactiva' },
      'draft': { class: 'warning', text: 'Borrador' },
      'closed': { class: 'danger', text: 'Cerrada' }
    };
    
    const config = statusConfig[status] || { class: 'secondary', text: status };
    
    return (
      <span className={`badge bg-${config.class}`}>
        {config.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="surveys-page">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="surveys-page">
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="surveys-page">
      {/* Header */}
      <div className="page-header">
        <h1>Gestión de Encuestas</h1>
        <div className="header-actions">
          <button 
            className="btn btn-outline-primary me-2" 
            onClick={handleCreate}
          >
            <i className="bi bi-plus-lg me-1"></i>
            Crear encuesta
          </button>
       
        </div>
      </div>

      {/* Surveys Grid */}
      <div className="surveys-container">
        {surveys.length === 0 ? (
          <div className="empty-state">
            <p>No hay encuestas disponibles</p>
          </div>
        ) : (
          <div className="surveys-grid">
            {surveys.map((survey) => (
              <div key={survey.survey_id} className="survey-card">
                <div className="survey-header">
                  <h3 className="survey-title">{survey.title}</h3>
                  {getStatusBadge(survey.status)}
                </div>
                
                <div className="survey-body">
                  <p className="survey-description">
                    {survey.description || 'Sin descripción'}
                  </p>
                </div>
                
                <div className="survey-actions">
                  <button 
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => handleEdit(survey)}
                  >
                    <i className="bi bi-pencil me-1"></i>
                    Editar
                  </button>
                  
                  <button 
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => handleDelete(survey)}
                  >
                    <i className="bi bi-trash me-1"></i>
                    Eliminar
                  </button>
                  
                  <button 
                    className="btn btn-outline-info btn-sm"
                    onClick={() => handleView(survey)}
                  >
                    <i className="bi bi-eye me-1"></i>
                    Vista previa
                  </button>
                  
                  {survey.status === 'active' && (
                    <button 
                      className="btn btn-outline-success btn-sm"
                      onClick={() => handleFinalize(survey)}
                    >
                      <i className="bi bi-check-circle me-1"></i>
                      Finalizar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <SurveyModal
          show={showModal}
          mode={modalMode}
          survey={editingSurvey}
          onClose={handleModalClose}
          onSubmit={handleModalSubmit}
        />
      )}
    </div>
  );
};

export default Surveys; 