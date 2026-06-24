import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
})

// Auth API
export const authAPI = {
  getCurrentUser: () => api.get('/api/auth/me'),
  logout: () => api.post('/api/auth/logout'),
}

// Resources API
export const resourceAPI = {
  getAll: (params) => api.get('/api/resources', { params }),
  search: (type, capacity, location) =>
    api.get('/api/resources', { params: { type, capacity, location } }),
  getById: (id) => api.get(`/api/resources/${id}`),
  create: (data) => api.post('/api/resources', data),
  update: (id, data) => api.put(`/api/resources/${id}`, data),
  delete: (id) => api.delete(`/api/resources/${id}`),
}

// Bookings API
export const bookingAPI = {
  create: (data) => api.post('/api/bookings', data),
  update: (id, data) => api.put(`/api/bookings/${id}`, data),
  getMyBookings: () => api.get('/api/bookings/my'),
  getAll: () => api.get('/api/bookings'),
  getById: (id) => api.get(`/api/bookings/${id}`),
  approve: (id, reason) => api.patch(`/api/bookings/${id}/approve`, { reason }),
  reject: (id, reason) => api.patch(`/api/bookings/${id}/reject`, { reason }),
  cancel: (id, reason) => api.patch(`/api/bookings/${id}/cancel`, { reason }),
}

// Tickets API
export const ticketAPI = {
  create: (data, files) => {
    const formData = new FormData()
    formData.append('ticket', JSON.stringify(data))
    if (files) {
      files.forEach((file) => {
        formData.append('images', file)
      })
    }
    return api.post('/api/tickets', formData)
  },
  getById: (id) => api.get(`/api/tickets/${id}`),
  updateStatus: (id, status, notes) =>
    api.patch(`/api/tickets/${id}/status`, { status, notes }),
  addComment: (id, comment) => api.post(`/api/tickets/${id}/comments`, { text: comment }),
  deleteComment: (ticketId, commentId) => api.delete(`/api/tickets/${ticketId}/comments/${commentId}`),
  assignTechnician: (id, technicianEmail) =>
    api.patch(`/api/tickets/${id}/assign`, null, { params: { technicianEmail } }),
  getAll: () => api.get('/api/tickets'),
  getMyTickets: () => api.get('/api/tickets/my'),
}

// Notifications API
export const notificationAPI = {
  getAll: () => api.get('/api/notifications'),
  getUnread: () => api.get('/api/notifications/unread'),
  markAsRead: (id) => api.patch(`/api/notifications/${id}/read`),
  delete: (id) => api.delete(`/api/notifications/${id}`),
}

// Notification Preferences API
export const notificationPreferencesAPI = {
  get: () => api.get('/api/notification-preferences'),
  update: (data) => api.put('/api/notification-preferences', data),
  patch: (data) => api.patch('/api/notification-preferences', data),
  reset: () => api.delete('/api/notification-preferences'),
}

// Users API
export const userAPI = {
  getProfile: () => api.get('/api/users/profile'),
  updateProfile: (data) => api.put('/api/users/profile', data),
  uploadProfileImage: (formData) => api.post('/api/users/profile/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  getAll: () => api.get('/api/users'),
  getById: (id) => api.get(`/api/users/${id}`),
  updateRole: (id, role) => api.patch(`/api/users/${id}/role`, null, { params: { role } }),
  deleteUser: (id) => api.delete(`/api/users/${id}`),
}

export default api

// QR Code API
export const qrCodeAPI = {
  verifyQRCode: (qrContent) => api.post('/api/qrcode/verify', { qrContent }),
  verifyBookingById: (bookingId) => api.post('/api/qrcode/verify-by-id', { bookingId }),
}
