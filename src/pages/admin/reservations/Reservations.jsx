import React, { useState, useEffect } from 'react';
import { reservationsAPI, facilitiesAPI, reservationTypesAPI, reservationStatusAPI, ownersAPI } from '../../../services/apiService';
import ReservationModal from './ReservationModal';
import './Reservations.css';

const Reservations = () => {
  const [reservations, setReservations] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [reservationTypes, setReservationTypes] = useState([]);
  const [reservationStatus, setReservationStatus] = useState([]);
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create', 'edit', 'view'
  const [selectedReservation, setSelectedReservation] = useState(null);

  // Calendar state
  const [currentDate, setCurrentDate] = useState(new Date());
  const [occupiedDates, setOccupiedDates] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Update occupied dates when reservations change
    updateOccupiedDates();
  }, [reservations]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Debug: Check if user is authenticated
      const token = localStorage.getItem('token');
      console.log('Token exists:', !!token);

      const [reservationsRes, facilitiesRes, typesRes, statusRes, ownersRes] = await Promise.all([
        reservationsAPI.getAll(),
        facilitiesAPI.getAll(),
        reservationTypesAPI.getAll(),
        reservationStatusAPI.getAll(),
        ownersAPI.getDetails()
      ]);

      console.log('Reservations API Response:', reservationsRes);
      console.log('Facilities API Response:', facilitiesRes);
      console.log('Types API Response:', typesRes);
      console.log('Status API Response:', statusRes);
      console.log('Owners API Response:', ownersRes);

      // Handle reservations data
      const reservationsData = reservationsRes?.data || reservationsRes?.reservations || reservationsRes || [];
      setReservations(Array.isArray(reservationsData) ? reservationsData : []);

      // Handle facilities data
      const facilitiesData = facilitiesRes?.data || facilitiesRes?.facilities || facilitiesRes || [];
      setFacilities(Array.isArray(facilitiesData) ? facilitiesData : []);

      // Handle types data
      const typesData = typesRes?.data || typesRes?.types || typesRes || [];
      setReservationTypes(Array.isArray(typesData) ? typesData : []);

      // Handle status data
      const statusData = statusRes?.data || statusRes?.status || statusRes || [];
      setReservationStatus(Array.isArray(statusData) ? statusData : []);

      // Handle owners data
      const ownersData = ownersRes?.data || ownersRes?.owners || ownersRes || [];
      const uniqueOwners = Array.isArray(ownersData) ? 
        ownersData.filter((owner, index, self) => 
          index === self.findIndex(o => o.Owner_id === owner.Owner_id)
        ) : [];
      
      console.log('Raw owners response:', ownersRes);
      console.log('Processed owners data:', ownersData);
      console.log('Unique owners:', uniqueOwners);
      console.log('Owner IDs available:', uniqueOwners.map(o => o.Owner_id));
      
      setOwners(uniqueOwners);

    } catch (error) {
      console.error('Error loading data:', error);
      setError('Error al cargar los datos: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateOccupiedDates = () => {
    const occupied = reservations.map(reservation => {
      const startDate = new Date(reservation.Reservation_start_time);
      const endDate = new Date(reservation.Reservation_end_time);
      
      return {
        date: startDate.toISOString().split('T')[0],
        startTime: startDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        endTime: endDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        tooltip: `Reservado: ${startDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} - ${endDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`,
        reservation: reservation
      };
    });
    setOccupiedDates(occupied);
  };

  const handleCreate = () => {
    setSelectedReservation(null);
    setModalMode('create');
    setShowModal(true);
  };

  const handleEdit = (reservation) => {
    setSelectedReservation(reservation);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleView = (reservation) => {
    setSelectedReservation(reservation);
    setModalMode('view');
    setShowModal(true);
  };

  const handleDelete = async (reservation) => {
    if (window.confirm(`¿Está seguro que desea eliminar la reserva de ${reservation.owner_name}?`)) {
      try {
        await reservationsAPI.delete(reservation.Reservation_id);
        await loadData();
      } catch (error) {
        console.error('Error deleting reservation:', error);
        alert('Error al eliminar la reserva: ' + error.message);
      }
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedReservation(null);
  };

  const handleModalSave = async () => {
    setShowModal(false);
    await loadData();
  };

  const formatDate = (dateTime) => {
    if (!dateTime) return 'N/A';
    const date = new Date(dateTime);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (dateTime) => {
    if (!dateTime) return 'N/A';
    const date = new Date(dateTime);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (statusId, statusName) => {
    const statusClasses = {
      1: 'bg-warning text-dark', // Pending
      2: 'bg-success', // Confirmed
      3: 'bg-info', // In Progress
      4: 'bg-danger', // Cancelled
      5: 'bg-secondary' // No Show
    };

    const className = statusClasses[statusId] || 'bg-secondary';
    return <span className={`badge ${className}`}>{statusName || 'N/A'}</span>;
  };

  const getFilteredReservations = () => {
    if (!statusFilter) return reservations;
    return reservations.filter(reservation => 
      reservation.Reservation_status_FK_ID?.toString() === statusFilter
    );
  };

  const generateCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const calendar = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      calendar.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toISOString().split('T')[0];
      const isOccupied = occupiedDates.some(occupied => occupied.date === dateStr);
      const isPast = date < today;
      
      calendar.push({
        day,
        date,
        dateStr,
        isOccupied,
        isPast,
        isToday: date.toDateString() === today.toDateString()
      });
    }
    
    return calendar;
  };

  const handleDateClick = (dateInfo) => {
    if (dateInfo.isPast) return;
    
    if (dateInfo.isOccupied) {
      // Show occupied date info or allow viewing reservations
      return;
    }
    
    // Open create modal for available date
    handleCreate();
  };

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const navigateMonth = (direction) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
  };

  if (loading) {
    return (
      <div className="reservations-page">
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
      <div className="reservations-page">
        <div className="alert alert-danger" role="alert">
          {error}
          <button className="btn btn-outline-danger ms-2" onClick={loadData}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4">
      <h2 className="mb-4">Reservas de Áreas Comunes</h2>

      <div className="row">
        {/* Calendar Section */}
        <div className="col-md-8">
          <div className="card">
            <div className="card-header bg-white">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h5>
                <div className="d-flex gap-2">
                  <button 
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => navigateMonth(-1)}
                  >
                    <i className="bi bi-chevron-left"></i>
                  </button>
                  <button 
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => navigateMonth(1)}
                  >
                    <i className="bi bi-chevron-right"></i>
                  </button>
                </div>
                <div className="dropdown">
                  <button className="btn btn-outline-secondary dropdown-toggle" type="button"
                    data-bs-toggle="dropdown">
                    <i className="bi bi-filter"></i> Estado
                  </button>
                  <ul className="dropdown-menu">
                    <li><a className="dropdown-item" href="#" onClick={() => setStatusFilter('')}>Todos</a></li>
                    <li><a className="dropdown-item" href="#" onClick={() => setStatusFilter('1')}>Pendiente</a></li>
                    <li><a className="dropdown-item" href="#" onClick={() => setStatusFilter('2')}>Confirmado</a></li>
                    <li><a className="dropdown-item" href="#" onClick={() => setStatusFilter('4')}>Cancelado</a></li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="card-body p-0">
              <div className="calendar-container">
                {/* Calendar Header */}
                <div className="calendar-header">
                  {dayNames.map(day => (
                    <div key={day} className="calendar-day-header">
                      {day}
                    </div>
                  ))}
                </div>
                
                {/* Calendar Body */}
                <div className="calendar-body">
                  {generateCalendar().map((dateInfo, index) => (
                    <div 
                      key={index} 
                      className={`calendar-day ${
                        !dateInfo ? 'empty' : 
                        dateInfo.isPast ? 'past' :
                        dateInfo.isOccupied ? 'occupied' : 
                        'available'
                      } ${dateInfo?.isToday ? 'today' : ''}`}
                      onClick={() => dateInfo && handleDateClick(dateInfo)}
                      style={{ cursor: dateInfo && !dateInfo.isPast ? 'pointer' : 'default' }}
                      title={dateInfo?.isOccupied ? 
                        occupiedDates.find(o => o.date === dateInfo.dateStr)?.tooltip : 
                        dateInfo?.isPast ? 'Fecha pasada' : 
                        dateInfo ? 'Disponible - Click para crear reserva' : ''
                      }
                    >
                      {dateInfo ? dateInfo.day : ''}
                    </div>
                  ))}
                </div>
                
                {/* Calendar Legend */}
                <div className="calendar-legend">
                  <div className="legend-item">
                    <div className="legend-color legend-available"></div>
                    <span>Disponible</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-color legend-occupied"></div>
                    <span>Ocupado</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-color legend-today"></div>
                    <span>Hoy</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reservations List Section */}
        <div className="col-md-4">
          <div className="card mb-4">
            <div className="card-header bg-white">
              <h5 className="mb-0">Reservas Actuales</h5>
            </div>
            <div className="card-body">
              {getFilteredReservations().length === 0 ? (
                <div className="text-center py-4">
                  <i className="bi bi-calendar-x display-4 text-muted"></i>
                  <p className="text-muted mt-2">No hay reservas</p>
                </div>
              ) : (
                <div className="list-group">
                  {getFilteredReservations().map((reservation) => (
                    <div key={reservation.Reservation_id} className="list-group-item">
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="flex-grow-1">
                          <h6 className="mb-1">{reservation.owner_name || 'N/A'}</h6>
                          <p className="mb-1 small text-muted">
                            {reservation.Reservation_type_name || 'N/A'}
                          </p>
                          <small className="text-muted">
                            {formatDate(reservation.Reservation_start_time)} - {formatTime(reservation.Reservation_start_time)}
                          </small>
                          <div className="mt-1">
                            {getStatusBadge(reservation.Reservation_status_FK_ID, reservation.Reservation_status_name)}
                          </div>
                        </div>
                        <div className="d-flex flex-column gap-1">
                          <button 
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleEdit(reservation)}
                            title="Editar"
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button 
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => handleView(reservation)}
                            title="Ver"
                          >
                            <i className="bi bi-eye"></i>
                          </button>
                          <button 
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(reservation)}
                            title="Eliminar"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Add Reservation Button */}
          <button 
            className="btn btn-primary w-100" 
            onClick={handleCreate}
          >
            <i className="bi bi-plus-circle me-2"></i>Nueva Reserva
          </button>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <ReservationModal
          show={showModal}
          mode={modalMode}
          reservation={selectedReservation}
          facilities={facilities}
          reservationTypes={reservationTypes}
          reservationStatus={reservationStatus}
          owners={owners}
          onClose={handleModalClose}
          onSave={handleModalSave}
        />
      )}
    </div>
  );
};

export default Reservations; 