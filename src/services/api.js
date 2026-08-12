import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Only redirect if not already on auth pages
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/register', data),
  login: (data) => api.post('/login', data),
  getProfile: () => api.get('/profile'),
  updateProfile: (data) => api.put('/profile', data),
  changePassword: (data) => api.put('/change-password', data),
};

// Courses API
export const coursesAPI = {
  getAll: (params) => api.get('/courses', { params }),
  getOne: (id) => api.get(`/courses/${id}`),
  create: (data) => api.post('/courses', data),
  update: (id, data) => api.put(`/courses/${id}`, data),
  delete: (id) => api.delete(`/courses/${id}`),
  enroll: (id) => api.post(`/courses/${id}/enroll`),
  getEnrolledCourses: () => api.get('/courses/enrolled'),
  addToWishlist: (id) => api.post(`/courses/${id}/wishlist`),
  removeFromWishlist: (id) => api.delete(`/courses/${id}/wishlist`),
  addReview: (id, data) => api.post(`/courses/${id}/reviews`, data),
};

// Quizzes API
export const quizzesAPI = {
  getByCourse: (courseId) => api.get(`/quizzes/course/${courseId}`),
  getOne: (id) => api.get(`/quizzes/${id}`),
  create: (data) => api.post('/quizzes', data),
  update: (id, data) => api.put(`/quizzes/${id}`, data),
  delete: (id) => api.delete(`/quizzes/${id}`),
  submit: (id, data) => api.post(`/quizzes/${id}/submit`, data),
  getResults: (id) => api.get(`/quizzes/${id}/results`),
};

// Users API
export const usersAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  getCourses: () => api.get('/users/courses'),
  updateProgress: (courseId, data) => api.put(`/users/courses/${courseId}/progress`, data),
  getWishlist: () => api.get('/users/wishlist'),
  getQuizResults: () => api.get('/users/quiz-results'),
  getAll: (params) => api.get('/users', { params }),
  updateStatus: (id, data) => api.put(`/users/${id}/status`, data),
};

// Admin API
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getCourses: (params) => api.get('/admin/courses', { params }),
  updateCourseStatus: (id, data) => api.put(`/admin/courses/${id}/status`, data),
  getQuizzes: (params) => api.get('/admin/quizzes', { params }),
  updateQuizStatus: (id, data) => api.put(`/admin/quizzes/${id}/status`, data),
  getUserAnalytics: (params) => api.get('/admin/analytics/users', { params }),
  getCourseAnalytics: () => api.get('/admin/analytics/courses'),
};

export default api;

