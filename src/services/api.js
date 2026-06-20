// Client API Service Layer
// Communicates with our unified Express fullstack server.

const getAuthToken = () => localStorage.getItem('token');

async function request(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  const response = await fetch(`/api${endpoint}`, config);
  let data;
try {
  data = await response.json();
} catch (err) {
  throw new Error('Server returned empty response');
}

  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }

  return data;
}

export const api = {
  // --- AUTH ENDPOINTS ---
  login: (credentials) => request('/auth/login', {
    method: 'POST',
    body: credentials,
  }),

  registerCustomer: (profile) => request('/auth/register/customer', {
    method: 'POST',
    body: profile,
  }),

  registerProvider: (profile) => request('/auth/register/provider', {
    method: 'POST',
    body: profile,
  }),

  getProfile: () => request('/auth/profile'),

  updateProfile: (profile) => request('/auth/profile', {
    method: 'PUT',
    body: profile,
  }),

  updateProviderProfile: (providerData) => request('/auth/provider-profile', {
    method: 'PUT',
    body: providerData,
  }),

  // --- SERVICES ENDPOINTS ---
  getAllServices: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    const queryString = query.toString();
    return request(`/services?${queryString}`);
  },

  getServiceById: (id) => request(`/services/${id}`),

  getProviderById: (id) => request(`/services/provider/${id}`),

  createService: (serviceData) => request('/services', {
    method: 'POST',
    body: serviceData,
  }),

  updateService: (id, serviceData) => request(`/services/${id}`, {
    method: 'PUT',
    body: serviceData,
  }),

  deleteService: (id) => request(`/services/${id}`, {
    method: 'DELETE',
  }),

  getProviderServices: () => request('/services/provider/list'),

  saveAvailability: (blockedDates) => request('/services/availability', {
    method: 'PUT',
    body: { blockedDates },
  }),

  // --- BOOKINGS ENDPOINTS ---
  createBooking: (bookingData) => request('/bookings', {
    method: 'POST',
    body: bookingData,
  }),

  getCustomerBookings: () => request('/bookings/customer'),

  getProviderBookings: () => request('/bookings/provider'),

  updateBookingStatus: (id, action) => request(`/bookings/${id}/status`, {
    method: 'PUT',
    body: { action }, // 'accept', 'reject', 'complete'
  }),

  cancelBooking: (id) => request(`/bookings/${id}/cancel`, {
    method: 'PUT',
  }),

  submitPayment: (paymentData) => request('/bookings/payment', {
    method: 'POST',
    body: paymentData,
  }),

  submitReview: (reviewData) => request('/bookings/review', {
    method: 'POST',
    body: reviewData,
  }),

  // --- NOTIFICATIONS & PRESET NEWS ---
  getNotifications: () => request('/bookings/notifications'),

  markNotificationsAsRead: () => request('/bookings/notifications/read', {
    method: 'PUT',
  }),

  // --- ADMIN SYSTEMS ---
  getAdminStats: () => request('/admin/stats'),

  getAdminUsers: () => request('/admin/users'),

  updateUserBlock: (id, block) => request(`/admin/users/${id}/block`, {
    method: 'PUT',
    body: { block },
  }),

  deleteUser: (id) => request(`/admin/users/${id}`, {
    method: 'DELETE',
  }),

  adminDeleteUser: (id) => request(`/admin/users/${id}`, {
    method: 'DELETE',
  }),

  getAdminProviders: () => request('/admin/providers'),

  updateProviderStatus: (id, status) => request(`/admin/providers/${id}/status`, {
    method: 'PUT',
    body: { status }, // 'approved', 'rejected', 'suspended'
  }),

  adminToggleProviderStatus: (id, status) => request(`/admin/providers/${id}/status`, {
    method: 'PUT',
    body: { status },
  }),

  getAdminBookings: () => request('/admin/bookings'),

  adminCancelBooking: (id) => request(`/bookings/${id}/cancel`, {
    method: 'PUT',
  }),

  adminCompleteBooking: (id) => request(`/bookings/${id}/status`, {
    method: 'PUT',
    body: { action: 'complete' },
  }),
  forgotPassword: (data) => request('/auth/forgot-password', {
  method: 'POST',
  body: data,
}),
};
