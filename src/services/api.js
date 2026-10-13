import axios from 'axios';

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? '/api' : 'https://dex-backend-14kj.onrender.com/api')
).replace(/\/+$/, '');

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
};

// Users API
export const usersAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  changePassword: (data) => api.put('/users/change-password', data),
};

// Courses API
export const coursesAPI = {
  getAll: (params) => api.get('/courses', { params }),
  getByGrade: () => api.get('/courses/by-grade'),
  getOne: (id) => api.get(`/courses/${id}`),
  getEnrolledCourses: () => api.get('/courses/enrolled'),
  enroll: (id) => api.post(`/courses/${id}/enroll`),
  create: (data) => api.post('/courses', data),
  update: (id, data) => api.put(`/courses/${id}`, data),
  delete: (id) => api.delete(`/courses/${id}`),
};

// Lessons API
export const lessonsAPI = {
  getByCourse: (courseId) => api.get(`/lessons/course/${courseId}`),
  getOne: (id) => api.get(`/lessons/${id}`),
  getPdfUrl: (id) => `${API_BASE_URL}/lessons/${id}/pdf`,
  markComplete: (id) => api.post(`/lessons/${id}/complete`),
  upload: (formData) =>
    api.post('/lessons/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
};

// Quizzes API
export const quizzesAPI = {
  getByLesson: (lessonId) => api.get(`/quizzes/lesson/${lessonId}`),
  getResults: (lessonId) => api.get(`/quizzes/lesson/${lessonId}/results`),
  getBulkStatus: (lessonIds) => api.post('/quizzes/bulk-status', { lessonIds }),
  submit: (id, data) => api.post(`/quizzes/${id}/submit`, data),
  create: (data) => api.post('/quizzes/create', data),
  getAdminOne: (id) => api.get(`/quizzes/admin/${id}`),
  update: (id, data) => api.put(`/quizzes/${id}`, data),
};

// Admin API
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  listUsers: (params) => api.get('/admin/users', { params }),
  getUser: (id) => api.get(`/admin/users/${id}`),
  createUser: (data) => api.post('/admin/users', data),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  listCourses: () => api.get('/admin/courses'),
  listEnrollments: () => api.get('/admin/enrollments'),
};

export default api;
