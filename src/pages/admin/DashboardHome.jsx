import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { ownersAPI, paymentsAPI, pqrsAPI, reservationsAPI } from '../../services/api';
import './DashboardHome.css';

const DashboardHome = () => {
  // Fetch dashboard statistics with error handling
  const { data: ownersResponse, isLoading: ownersLoading, error: ownersError } = useQuery('owners', ownersAPI.getAll, {
    retry: 1,
    refetchOnWindowFocus: false,
    onError: (error) => {
      console.error('Owners API Error:', error);
      console.log('Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: error.config
      });
    }
  });
  
  const { data: paymentsResponse, isLoading: paymentsLoading, error: paymentsError } = useQuery('payments', paymentsAPI.getAll, {
    retry: 1,
    refetchOnWindowFocus: false,
    onError: (error) => {
      console.error('Payments API Error:', error);
      console.log('Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: error.config
      });
    }
  });
  
  const { data: pqrsResponse, isLoading: pqrsLoading, error: pqrsError } = useQuery('pqrs', pqrsAPI.getAll, {
    retry: 1,
    refetchOnWindowFocus: false,
    onError: (error) => {
      console.error('PQRS API Error:', error);
      console.log('Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: error.config
      });
    }
  });
  
  const { data: reservationsResponse, isLoading: reservationsLoading, error: reservationsError } = useQuery('reservations', reservationsAPI.getAll, {
    retry: 1,
    refetchOnWindowFocus: false,
    onError: (error) => {
      console.error('Reservations API Error:', error);
      console.log('Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: error.config
      });
    }
  });

  // Ensure all data is properly handled as arrays
  const ownersData = Array.isArray(ownersResponse?.data) ? ownersResponse.data : [];
  const paymentsData = Array.isArray(paymentsResponse?.data) ? paymentsResponse.data : [];
  const pqrsData = Array.isArray(pqrsResponse?.data) ? pqrsResponse.data : [];
  const reservationsData = Array.isArray(reservationsResponse?.data) ? reservationsResponse.data : [];

  // Check if any queries are loading
  const isLoading = ownersLoading || paymentsLoading || pqrsLoading || reservationsLoading;

  // Check if any queries have errors
  const hasErrors = ownersError || paymentsError || pqrsError || reservationsError;

  // Log successful data
  React.useEffect(() => {
    if (ownersData.length) console.log('Owners data loaded:', ownersData);
    if (paymentsData.length) console.log('Payments data loaded:', paymentsData);
    if (pqrsData.length) console.log('PQRS data loaded:', pqrsData);
    if (reservationsData.length) console.log('Reservations data loaded:', reservationsData);
  }, [ownersData, paymentsData, pqrsData, reservationsData]);

  const stats = [
    {
      title: 'Propietarios',
      number: ownersData.length || 0,
      icon: 'bi-people-fill',
      color: 'owners',
      link: '/admin/owners'
    },
    {
      title: 'Pagos Pendientes',
      number: paymentsData.filter(p => p.status === 'pending').length || 0,
      icon: 'bi-credit-card-fill',
      color: 'payments',
      link: '/admin/payments'
    },
    {
      title: 'PQRS Activas',
      number: pqrsData.filter(p => p.status === 'active').length || 0,
      icon: 'bi-question-circle-fill',
      color: 'pqrs',
      link: '/admin/pqrs'
    },
    {
      title: 'Reservas Hoy',
      number: reservationsData.filter(r => {
        const today = new Date().toISOString().split('T')[0];
        return r.date === today;
      }).length || 0,
      icon: 'bi-calendar-check-fill',
      color: 'reservations',
      link: '/admin/reservations'
    }
  ];

  const quickActions = [
    {
      title: 'Nuevo Propietario',
      icon: 'bi-person-plus',
      link: '/admin/owners',
      color: '#28a745'
    },
    {
      title: 'Registrar Pago',
      icon: 'bi-cash-coin',
      link: '/admin/payments',
      color: '#17a2b8'
    },
    {
      title: 'Nueva PQRS',
      icon: 'bi-chat-dots',
      link: '/admin/pqrs',
      color: '#dc3545'
    },
    {
      title: 'Crear Encuesta',
      icon: 'bi-clipboard-plus',
      link: '/admin/surveys',
      color: '#ffc107'
    }
  ];

  const recentActivity = [
    {
      type: 'payment',
      title: 'Pago registrado por Juan Pérez',
      time: 'Hace 5 minutos',
      icon: 'bi-credit-card'
    },
    {
      type: 'pqrs',
      title: 'Nueva PQRS creada',
      time: 'Hace 15 minutos',
      icon: 'bi-question-circle'
    },
    {
      type: 'reservation',
      title: 'Reserva confirmada para sala común',
      time: 'Hace 1 hora',
      icon: 'bi-calendar-check'
    },
    {
      type: 'notification',
      title: 'Notificación enviada a propietarios',
      time: 'Hace 2 horas',
      icon: 'bi-bell'
    }
  ];

  // Show loading state
  if (isLoading) {
    return (
      <div className="dashboard-home">
        <div className="dashboard-header">
          <h1>Panel de Control</h1>
          <p className="text-muted">Cargando datos...</p>
        </div>
        <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  // Show error state with more details
  if (hasErrors) {
    const errorDetails = [
      ownersError && `Propietarios: ${ownersError.message}`,
      paymentsError && `Pagos: ${paymentsError.message}`,
      pqrsError && `PQRS: ${pqrsError.message}`,
      reservationsError && `Reservas: ${reservationsError.message}`
    ].filter(Boolean);

    return (
      <div className="dashboard-home">
        <div className="dashboard-header">
          <h1>Panel de Control</h1>
          <p className="text-muted">Error al cargar los datos</p>
        </div>
        <div className="alert alert-warning" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          <strong>Errores detectados:</strong>
          <ul className="mt-2 mb-0">
            {errorDetails.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
          <hr />
          <small className="text-muted">
            Verifica que el backend esté ejecutándose en http://localhost:3000 y que las rutas de la API sean correctas.
            <br />
            Revisa la consola del navegador para más detalles técnicos.
          </small>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-home">
      <div className="dashboard-header">
        <h1>Panel de Control</h1>
        <p className="text-muted">Bienvenido al sistema de administración de VALHALLA</p>
      </div>

      {/* Statistics Cards */}
      <div className="dashboard-stats">
        {stats.map((stat, index) => (
          <div key={index} className={`stat-card ${stat.color}`}>
            <div className="stat-icon">
              <i className={stat.icon}></i>
            </div>
            <div className="stat-number">{stat.number}</div>
            <div className="stat-label">{stat.title}</div>
            <Link to={stat.link} className="stat-link">
              Ver detalles <i className="bi bi-arrow-right"></i>
            </Link>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="dashboard-section">
        <h3>Acciones Rápidas</h3>
        <div className="quick-actions">
          {quickActions.map((action, index) => (
            <Link key={index} to={action.link} className="quick-action-btn">
              <div className="quick-action-icon" style={{ backgroundColor: action.color }}>
                <i className={`bi ${action.icon}`}></i>
              </div>
              <span>{action.title}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="dashboard-section">
        <div className="section-header">
          <h3>Actividad Reciente</h3>
          <Link to="#" className="view-all">Ver todo</Link>
        </div>
        <div className="recent-activity">
          {recentActivity.map((activity, index) => (
            <div key={index} className="activity-item">
              <div className={`activity-icon ${activity.type}`}>
                <i className={`bi ${activity.icon}`}></i>
              </div>
              <div className="activity-details">
                <div className="activity-title">{activity.title}</div>
                <div className="activity-time">{activity.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Section */}
      <div className="dashboard-section">
        <div className="row">
          <div className="col-md-6">
            <div className="chart-container">
              <div className="chart-header">
                <h4>Pagos Mensuales</h4>
              </div>
              <div className="chart-placeholder">
                <div className="chart-message">
                  <i className="bi bi-bar-chart-line"></i>
                  <p>Gráfico de pagos mensuales</p>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="chart-container">
              <div className="chart-header">
                <h4>PQRS por Categoría</h4>
              </div>
              <div className="chart-placeholder">
                <div className="chart-message">
                  <i className="bi bi-pie-chart"></i>
                  <p>Distribución de PQRS por categoría</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome; 