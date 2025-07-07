// This file serves as a compatibility layer for existing imports
// It re-exports everything from apiService.js

// Re-export everything from apiService.js for backward compatibility
import api, {
  apartmentsAPI,
  towersAPI,
  apartmentStatusAPI,
  ownersAPI,
  authAPI,
  usersAPI,
  rolesAPI,
  vehicleTypesAPI,
  pqrsAPI,
  pqrsCategoriesAPI,
  notificationsAPI,
  visitorsAPI,
  facilitiesAPI,
  permissionsAPI,
  parkingAPI,
  petsAPI,
  paymentsAPI,
  reservationsAPI,
  reservationTypesAPI,
  reservationStatusAPI,
  surveyAPI,
  guardsAPI
} from './apiService';

export {
  apartmentsAPI,
  towersAPI,
  apartmentStatusAPI,
  ownersAPI,
  authAPI,
  usersAPI,
  rolesAPI,
  vehicleTypesAPI,
  pqrsAPI,
  pqrsCategoriesAPI,
  notificationsAPI,
  visitorsAPI,
  facilitiesAPI,
  permissionsAPI,
  parkingAPI,
  petsAPI,
  paymentsAPI,
  reservationsAPI,
  reservationTypesAPI,
  reservationStatusAPI,
  surveyAPI,
  guardsAPI
};

export default api; 