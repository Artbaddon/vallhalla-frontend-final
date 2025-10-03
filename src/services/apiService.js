import axios from "axios";

/**
 * Base API URL - use environment variable or default
 */
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

/**
 * Axios instance with default configuration
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Request interceptor to add auth token to requests
 */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Response interceptor for error handling
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log errors in development
    if (import.meta.env.DEV) {
      console.error("API Error:", error.response || error);
    }

    // Handle token expiration
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      // Optionally redirect to login
      // window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

/**
 * API service for apartments
 * Based on Postman collection endpoints
 */
export const apartmentsAPI = {
  getAll: async () => {
    const response = await api.get("/apartments");
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/apartments/${id}`);
    return response.data;
  },
  getDetails: async () => {
    const response = await api.get("/apartments/details");
    return response.data;
  },
  getDetailById: async (id) => {
    const response = await api.get(`/apartments/${id}/details`);
    return response.data;
  },
  searchByNumber: async (apartmentNumber) => {
    const response = await api.get(
      `/apartments/search/number?apartment_number=${apartmentNumber}`
    );
    return response.data;
  },
  searchByOwner: async (ownerId) => {
    const response = await api.get(
      `/apartments/search/owner?owner_id=${ownerId}`
    );
    return response.data;
  },
  searchByStatus: async (statusId) => {
    const response = await api.get(
      `/apartments/search/status?status_id=${statusId}`
    );
    return response.data;
  },
  searchByTower: async (towerId) => {
    const response = await api.get(
      `/apartments/search/tower?tower_id=${towerId}`
    );
    return response.data;
  },
  getOccupancyReport: async () => {
    const response = await api.get("/apartments/report/occupancy");
    return response.data;
  },
  create: async (data) => {
    const response = await api.post("/apartments", data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/apartments/${id}`, data);
    return response.data;
  },
  updateStatus: async (id, statusId) => {
    const response = await api.patch(`/apartments/${id}/status`, {
      status_id: statusId,
    });
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/apartments/${id}`);
    return response.data;
  },
};

/**
 * API service for towers
 * Based on Postman collection endpoints
 */
export const towersAPI = {
  getAll: async () => {
    const response = await api.get("/towers");
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/towers/${id}`);
    return response.data;
  },
  create: async (data) => {
    const response = await api.post("/towers", data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/towers/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/towers/${id}`);
    return response.data;
  },
};

/**
 * API service for apartment statuses
 * Based on Postman collection endpoints
 */
export const apartmentStatusAPI = {
  getAll: async () => {
    const response = await api.get("/apartment-status");
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/apartment-status/${id}`);
    return response.data;
  },
  create: async (data) => {
    const response = await api.post("/apartment-status", data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/apartment-status/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/apartment-status/${id}`);
    return response.data;
  },
};

/**
 * API service for owners
 * Based on Postman collection endpoints
 */
export const ownersAPI = {
  getAll: async () => {
    const response = await api.get("/owners");
    return response.data.owners;
  },
  getById: async (id) => {
    const response = await api.get(`/owners/${id}`);
    return response.data;
  },
  getDetails: async () => {
    const response = await api.get("/owners/details");
    return response.data.owners;
  },
  getDetailById: async (id) => {
    const response = await api.get(`/owners/${id}/details`);
    return response.data;
  },
  create: async (data) => {
    const response = await api.post("/owners", data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/owners/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/owners/${id}`);
    return response.data;
  },
};

/**
 * API service for authentication
 * Based on Postman collection endpoints
 */
export const authAPI = {
  login: async (credentials) => {
    return await api.post("/auth/login", credentials);
  },
  register: async (userData) => {
    return await api.post("/auth/register", userData);
  },
  validateToken: async () => {
    return await api.get("/auth/validate-token");
  },
  forgotPassword: async (email) => {
    return await api.post("/auth/forgot-password", email);
  },
  resetPassword: async (data) => {
    return await api.post("/auth/reset-password", data);
  },
  changePassword: async (data) => {
    return await api.post("/auth/change-password", data);
  },
};

/**
 * API service for users
 * Based on Postman collection endpoints
 */
export const usersAPI = {
  getAll: async () => {
    const response = await api.get("/users");
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },
  getDetails: async () => {
    const response = await api.get("/users/details");
    return response.data;
  },
  searchByName: async (name) => {
    const response = await api.get(`/users/search?name=${name}`);
    return response.data;
  },
  create: async (data) => {
    const response = await api.post("/users", data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },
  updateStatus: async (id, statusId) => {
    const response = await api.patch(`/users/${id}/status`, {
      status_id: statusId,
    });
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
};

/**
 * API service for roles
 * Based on Postman collection endpoints
 */
export const rolesAPI = {
  getAll: async () => {
    const response = await api.get("/roles");
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/roles/${id}`);
    return response.data;
  },
  create: async (data) => {
    const response = await api.post("/roles", data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/roles/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/roles/${id}`);
    return response.data;
  },
};

/**
 * API service for vehicle types
 * Based on Postman collection endpoints
 */
export const vehicleTypesAPI = {
  getAll: async () => {
    const response = await api.get("/vehicle-types");
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/vehicle-types/${id}`);
    return response.data;
  },
  create: async (data) => {
    const response = await api.post("/vehicle-types", data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/vehicle-types/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/vehicle-types/${id}`);
    return response.data;
  },
};

/**
 * API service for PQRS
 * Based on Postman collection endpoints
 */
export const pqrsAPI = {
  getAll: async () => {
    const response = await api.get("/pqrs");
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/pqrs/${id}`);
    return response.data;
  },
  getStats: async () => {
    const response = await api.get("/pqrs/stats");
    return response.data;
  },
  getByOwner: async (ownerId) => {
    const response = await api.get(`/pqrs/owner/${ownerId}`);
    return response.data;
  },
  getByStatus: async (statusId) => {
    const response = await api.get(`/pqrs/status/${statusId}`);
    return response.data;
  },
  getByCategory: async (categoryId) => {
    const response = await api.get(`/pqrs/category/${categoryId}`);
    return response.data;
  },
  create: async (data) => {
    const response = await api.post("/pqrs", data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/pqrs/${id}`, data);
    return response.data;
  },
  updateStatus: async (id, data) => {
    const response = await api.put(`/pqrs/${id}/status`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/pqrs/${id}`);
    return response.data;
  },
};

/**
 * API service for PQRS Categories
 * Based on Postman collection endpoints
 */
export const pqrsCategoriesAPI = {
  getAll: async () => {
    const response = await api.get("/pqrs-categories");
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/pqrs-categories/${id}`);
    return response.data;
  },
  create: async (data) => {
    const response = await api.post("/pqrs-categories", data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/pqrs-categories/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/pqrs-categories/${id}`);
    return response.data;
  },
};

/**
 * API service for visitors
 * Based on Postman collection endpoints
 */
export const visitorsAPI = {
  getAll: async () => {
    const response = await api.get("/visitors");
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/visitors/${id}`);
    return response.data;
  },
  getByHost: async (hostId) => {
    const response = await api.get(`/visitors/host/${hostId}`);
    return response.data;
  },
  getByDate: async (date) => {
    const response = await api.get(`/visitors/date/${date}`);
    return response.data;
  },
  create: async (data) => {
    const response = await api.post("/visitors", data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/visitors/${id}`, data);
    return response.data;
  },
  visitorExit: async (id) => {
    const response = await api.put(`/visitors/${id}/exit`);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/visitors/${id}`);
    return response.data;
  },
};

/**
 * API service for facilities
 * Based on Postman collection endpoints
 */
export const facilitiesAPI = {
  getAll: async () => {
    const response = await api.get("/facilities");
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/facilities/${id}`);
    return response.data;
  },
  getByStatus: async (status) => {
    const response = await api.get(`/facilities/status?status=${status}`);
    return response.data;
  },
  create: async (data) => {
    const response = await api.post("/facilities", data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/facilities/${id}`, data);
    return response.data;
  },
  updateStatus: async (id, status) => {
    const response = await api.put(`/facilities/${id}/status`, { status });
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/facilities/${id}`);
    return response.data;
  },
};

/**
 * API service for permissions
 * Based on Postman collection endpoints
 */
export const permissionsAPI = {
  getAll: async () => {
    const response = await api.get("/permissions");
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/permissions/${id}`);
    return response.data;
  },
  create: async (data) => {
    const response = await api.post("/permissions", data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/permissions/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/permissions/${id}`);
    return response.data;
  },
};

/**
 * API service for parking
 * Based on Postman collection endpoints
 */
export const parkingAPI = {
  getAll: async () => {
    const response = await api.get("/parking");
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/parking/${id}`);
    return response.data;
  },
  create: async (data) => {
    const response = await api.post("/parking", data);
    return response.data;
  },
  assignVehicle: async (parkingId, vehicleTypeId) => {
    const response = await api.post("/parking/assign-vehicle", {
      parkingId,
      vehicleTypeId
    });
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/parking/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/parking/${id}`);
    return response.data;
  },
  getAvailable: async () => {
    const response = await api.get("/parking/available");
    return response.data;
  },
  reserve: async (data) => {
    const response = await api.post("/parking/reserve", data);
    return response.data;
  },
  getMySpots: async () => {
    const response = await api.get("/parking/my-spots");
    return response.data;
  },
  pay: async (data) => {
    const response = await api.post("/parking/pay", data);
    return response.data;
  }
};

/**
 * API service for pets
 * Based on Postman collection endpoints
 */
export const petsAPI = {
  getAll: async () => {
    const response = await api.get("/pets");
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/pets/${id}`);
    return response.data;
  },
  create: async (data) => {
    const response = await api.post("/pets", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/pets/${id}`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/pets/${id}`);
    return response.data;
  },
};

/**
 * API service for payments
 * Based on Postman collection endpoints
 */
export const paymentsAPI = {
  getAll: async () => {
    const response = await api.get("/payment");
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/payment/${id}`);
    return response.data;
  },
  getStats: async () => {
    const response = await api.get("/payment/stats");
    return response.data;
  },
  getByOwner: async (ownerId) => {
    const response = await api.get(`/payment/owner/${ownerId}`);
    return response.data;
  },
  getPendingByOwner: async (ownerId) => {
    const response = await api.get(`/payment/owner/${ownerId}/pending`);
    return response.data;
  },
  create: async (data) => {
    const response = await api.post("/payment", data);
    return response.data;
  },
  makePayment: async (ownerId, paymentId, data) => {
    const response = await api.post(
      `/payment/owner/${ownerId}/pay/${paymentId}`,
      data
    );
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/payment/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/payment/${id}`);
    return response.data;
  },
};

/**
 * API service for reservations
 * Based on Postman collection endpoints
 */
export const reservationsAPI = {
  getAll: async () => {
    const response = await api.get("/reservations");
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/reservations/${id}`);
    return response.data;
  },
  getByOwner: async (ownerId) => {
    const response = await api.get(`/reservations/owner/${ownerId}`);
    return response.data;
  },
  getByDateRange: async (startDate, endDate) => {
    const response = await api.get(
      `/reservations/date-range?start_date=${startDate}&end_date=${endDate}`
    );
    return response.data;
  },
  create: async (data) => {
    const response = await api.post("/reservations", data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/reservations/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/reservations/${id}`);
    return response.data;
  },
};

/**
 * API service for notifications
 * Based on backend router endpoints
 */
export const notificationsAPI = {
  getAll: async () => {
    const response = await api.get("/notifications");
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/notifications/${id}`);
    return response.data;
  },
  getByUser: async (userId) => {
    const response = await api.get(`/notifications/user/${userId}`);
    return response.data;
  },
  getByType: async (typeId) => {
    const response = await api.get(`/notifications/type/${typeId}`);
    return response.data;
  },
  getUnread: async (userId) => {
    const response = await api.get(`/notifications/unread/${userId}`);
    return response.data;
  },
  getStats: async () => {
    const response = await api.get("/notifications/stats");
    return response.data;
  },
  create: async (data) => {
    const response = await api.post("/notifications", data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/notifications/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  },
  // Get public notifications (for homepage)
  getPublic: async () => {
    const response = await api.get("/notifications");
    return response.data;
  }
};

/**
 * API service for reservation types
 * Based on backend router endpoints
 */
export const reservationTypesAPI = {
  getAll: async () => {
    const response = await api.get("/reservation-types");
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/reservation-types/${id}`);
    return response.data;
  },
  create: async (data) => {
    const response = await api.post("/reservation-types", data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/reservation-types/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/reservation-types/${id}`);
    return response.data;
  },
};

/**
 * API service for reservation status
 * Based on backend router endpoints
 */
export const reservationStatusAPI = {
  getAll: async () => {
    const response = await api.get("/reservation-status");
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/reservation-status/${id}`);
    return response.data;
  },
  create: async (data) => {
    const response = await api.post("/reservation-status", data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/reservation-status/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/reservation-status/${id}`);
    return response.data;
  },
};

/**
 * API service for surveys
 * Based on Postman collection endpoints
 */
export const surveyAPI = {
  getAll: async () => {
    const response = await api.get("/surveys");
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/surveys/${id}`);
    return response.data;
  },
  create: async (data) => {
    const response = await api.post("/surveys", data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/surveys/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/surveys/${id}`);
    return response.data;
  },
  getQuestions: async (id) => {
    const response = await api.get(`/surveys/${id}/questions`);
    return response.data;
  },
  submitAnswer: async (id, answers) => {
    const response = await api.post(`/surveys/${id}/answers`, { answers });
    return response.data;
  },
  getMyAnsweredSurveys: async () => {
    const response = await api.get("/surveys/my-answered");
    return response.data;
  },
  getMyPendingSurveys: async () => {
    const response = await api.get("/surveys/my-pending");
    return response.data;
  },
  getStats: async (id) => {
    const response = await api.get(`/surveys/${id}/stats`);
    return response.data;
  },
  createWithQuestions: async (data) => {
    const response = await api.post("/surveys/with-questions", data);
    return response.data;
  }
};

/**
 * API service for guards
 * Based on backend router endpoints
 */
export const guardsAPI = {
  getAll: async () => {
    const response = await api.get("/guards");
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/guards/${id}`);
    return response.data;
  },
  getByShift: async (shift) => {
    const response = await api.get(`/guards/shift/${shift}`);
    return response.data;
  },
  getByDocument: async (documentNumber) => {
    const response = await api.get(`/guards/document/${documentNumber}`);
    return response.data;
  },
  create: async (data) => {
    const response = await api.post("/guards", data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/guards/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/guards/${id}`);
    return response.data;
  },
};

export default api;
