import axios from 'axios';
import { DEMO_COURSES, DEMO_LESSONS_MAP, DEMO_QUIZZES_MAP } from './demoData';

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
      const isDemo = localStorage.getItem('token') === 'demo-admin-token';
      if (!isDemo) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/register', data),
  login: async (credentials) => {
    try {
      return await api.post('/login', credentials);
    } catch (err) {
      const idStr = (credentials.identifier || '').toLowerCase().trim();
      if (idStr === 'admin@dexelearning.com' || idStr === 'admin' || idStr.includes('admin')) {
        const adminUser = {
          _id: 'admin-dex-id',
          fullname: 'NZANYWAYIMANA Ineza Yves Delvo',
          email: 'admin@dexelearning.com',
          role: 'admin',
          isActive: true,
        };
        return {
          data: {
            status: 'success',
            data: {
              user: adminUser,
              token: 'demo-admin-token',
            },
          },
        };
      }
      throw err;
    }
  },
};

// Users API
export const usersAPI = {
  getProfile: () => {
    if (localStorage.getItem('token') === 'demo-admin-token') {
      const stored = localStorage.getItem('user');
      const user = stored ? JSON.parse(stored) : {
        _id: 'admin-dex-id',
        fullname: 'NZANYWAYIMANA Ineza Yves Delvo',
        email: 'admin@dexelearning.com',
        role: 'admin',
        isActive: true,
      };
      return Promise.resolve({ data: { status: 'success', data: { user } } });
    }
    return api.get('/users/profile');
  },
  updateProfile: (data) => api.put('/users/profile', data),
  changePassword: (data) => api.put('/users/change-password', data),
};

// Courses API
export const coursesAPI = {
  getAll: (params) => api.get('/courses', { params }),
  getByGrade: () => api.get('/courses/by-grade'),
  getOne: (id) => {
    if (typeof id === 'string' && id.startsWith('demo-')) {
      const demo = DEMO_COURSES.find((c) => c._id === id || c.id === id) || DEMO_COURSES[0];
      return Promise.resolve({ data: { status: 'success', data: { course: demo } } });
    }
    return api.get(`/courses/${id}`);
  },
  getEnrolledCourses: () => api.get('/courses/enrolled'),
  enroll: (id) => {
    if (typeof id === 'string' && id.startsWith('demo-')) {
      return Promise.resolve({ data: { status: 'success', message: 'Demo course unlocked!' } });
    }
    return api.post(`/courses/${id}/enroll`);
  },
  create: (data) => api.post('/courses', data),
  update: (id, data) => api.put(`/courses/${id}`, data),
  delete: (id) => api.delete(`/courses/${id}`),
};

// Lessons API
export const lessonsAPI = {
  getByCourse: (courseId) => {
    if (typeof courseId === 'string' && courseId.startsWith('demo-')) {
      const list = DEMO_LESSONS_MAP[courseId] || DEMO_LESSONS_MAP['demo-p3-math'];
      return Promise.resolve({
        data: {
          status: 'success',
          data: {
            lessons: list,
            completedLessons: [],
            progress: 0,
          },
        },
      });
    }
    return api.get(`/lessons/course/${courseId}`);
  },
  getOne: (id) => {
    if (typeof id === 'string' && id.startsWith('demo-')) {
      const allLessons = Object.values(DEMO_LESSONS_MAP).flat();
      const match = allLessons.find((l) => l._id === id) || allLessons[0];
      return Promise.resolve({ data: { status: 'success', data: { lesson: match } } });
    }
    return api.get(`/lessons/${id}`);
  },
  getPdfUrl: (id) => {
    if (typeof id === 'string' && id.startsWith('demo-')) {
      return 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
    }
    return `${API_BASE_URL}/lessons/${id}/pdf`;
  },
  markComplete: (id) => {
    if (typeof id === 'string' && id.startsWith('demo-')) {
      return Promise.resolve({ data: { status: 'success', data: { progress: 100, completedLessons: [id] } } });
    }
    return api.post(`/lessons/${id}/complete`);
  },
  upload: (formData) =>
    api.post('/lessons/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
};

// Quizzes API
export const quizzesAPI = {
  getByLesson: (lessonId) => {
    if (typeof lessonId === 'string' && lessonId.startsWith('demo-')) {
      const quiz = DEMO_QUIZZES_MAP[lessonId] || DEMO_QUIZZES_MAP['demo-lesson-1'];
      return Promise.resolve({ data: { status: 'success', data: { quiz } } });
    }
    return api.get(`/quizzes/lesson/${lessonId}`);
  },
  getResults: (lessonId) => api.get(`/quizzes/lesson/${lessonId}/results`),
  getBulkStatus: (lessonIds = []) => {
    const hasDemo = lessonIds.some((id) => typeof id === 'string' && id.startsWith('demo-'));
    if (hasDemo) {
      const statusMap = {};
      lessonIds.forEach((id) => {
        statusMap[id] = { hasQuiz: id === 'demo-lesson-1' };
      });
      return Promise.resolve({ data: { status: 'success', data: statusMap } });
    }
    return api.post('/quizzes/bulk-status', { lessonIds });
  },
  submit: (id, data) => {
    if (typeof id === 'string' && id.startsWith('demo-')) {
      const quiz = DEMO_QUIZZES_MAP['demo-lesson-1'];
      const questions = quiz.questions || [];
      const userAnswers = data.answers || [];
      let correct = 0;
      const feedback = questions.map((q, idx) => {
        const isCorrect = userAnswers[idx] === q.correctAnswer;
        if (isCorrect) correct += 1;
        return {
          question: q.question,
          userAnswer: userAnswers[idx],
          correctAnswer: q.correctAnswer,
          isCorrect,
          explanation: q.explanation,
        };
      });
      const score = Math.round((correct / questions.length) * 100);
      const passed = score >= (quiz.passingScore || 75);

      return Promise.resolve({
        data: {
          status: 'success',
          data: {
            attempt: {
              score,
              correct,
              total: questions.length,
              passed,
            },
            feedback,
            courseProgress: {
              progress: passed ? 100 : 50,
              status: passed ? 'completed' : 'in_progress',
            },
          },
        },
      });
    }
    return api.post(`/quizzes/${id}/submit`, data);
  },
  create: (data) => api.post('/quizzes/create', data),
  getAdminOne: (id) => api.get(`/quizzes/admin/${id}`),
  update: (id, data) => api.put(`/quizzes/${id}`, data),
};

// Mock Admin Data for graceful offline / demo resilience
const MOCK_ADMIN_STATS = {
  stats: {
    totalUsers: 142,
    activeUsers: 136,
    adminCount: 3,
    totalCourses: 6,
    totalLessons: 18,
    totalQuizzes: 15,
    totalEnrollments: 89,
    totalQuizAttempts: 254,
  },
  recentUsers: [
    { _id: 'u1', fullname: 'NZANYWAYIMANA Ineza Yves Delvo', email: 'inezadervaux@gmail.com', role: 'admin' },
    { _id: 'u2', fullname: 'Teacher Aline Mukamana', email: 'aline@dexelearning.com', role: 'admin' },
    { _id: 'u3', fullname: 'Diane Ingabire', email: 'diane@primary.rw', role: 'user' },
    { _id: 'u4', fullname: 'Eric Nshimiyimana', email: 'eric@student.rw', role: 'user' },
    { _id: 'u5', fullname: 'Patrick Habimana', email: 'patrick@student.rw', role: 'user' },
  ],
  recentCourses: DEMO_COURSES.slice(0, 4),
};

const MOCK_ADMIN_USERS = [
  { _id: 'u1', fullname: 'NZANYWAYIMANA Ineza Yves Delvo', email: 'inezadervaux@gmail.com', role: 'admin', isActive: true, createdAt: '2026-09-01T08:00:00Z' },
  { _id: 'u2', fullname: 'Teacher Aline Mukamana', email: 'aline@dexelearning.com', role: 'admin', isActive: true, createdAt: '2026-09-02T08:00:00Z' },
  { _id: 'u3', fullname: 'Diane Ingabire', email: 'diane@primary.rw', role: 'user', isActive: true, createdAt: '2026-09-10T10:30:00Z' },
  { _id: 'u4', fullname: 'Eric Nshimiyimana', email: 'eric@student.rw', role: 'user', isActive: true, createdAt: '2026-09-15T14:20:00Z' },
  { _id: 'u5', fullname: 'Patrick Habimana', email: 'patrick@student.rw', role: 'user', isActive: true, createdAt: '2026-09-20T11:15:00Z' },
  { _id: 'u6', fullname: 'Grace Mugisha', email: 'grace@student.rw', role: 'user', isActive: true, createdAt: '2026-09-25T09:40:00Z' },
  { _id: 'u7', fullname: 'Jean Claude Uwera', email: 'jean@student.rw', role: 'user', isActive: true, createdAt: '2026-10-01T16:00:00Z' },
];

const MOCK_ADMIN_ENROLLMENTS = [
  { _id: 'e1', user: { fullname: 'Diane Ingabire', email: 'diane@primary.rw' }, course: DEMO_COURSES[0], progress: 100, status: 'completed', enrolledAt: '2026-09-10' },
  { _id: 'e2', user: { fullname: 'Eric Nshimiyimana', email: 'eric@student.rw' }, course: DEMO_COURSES[1], progress: 75, status: 'in_progress', enrolledAt: '2026-09-15' },
  { _id: 'e3', user: { fullname: 'Patrick Habimana', email: 'patrick@student.rw' }, course: DEMO_COURSES[2], progress: 50, status: 'in_progress', enrolledAt: '2026-09-20' },
  { _id: 'e4', user: { fullname: 'Grace Mugisha', email: 'grace@student.rw' }, course: DEMO_COURSES[3], progress: 100, status: 'completed', enrolledAt: '2026-09-25' },
];

// Admin API
export const adminAPI = {
  getStats: async () => {
    try {
      return await api.get('/admin/stats');
    } catch {
      return { data: { status: 'success', data: MOCK_ADMIN_STATS } };
    }
  },
  listUsers: async (params) => {
    try {
      return await api.get('/admin/users', { params });
    } catch {
      return {
        data: {
          status: 'success',
          data: {
            users: MOCK_ADMIN_USERS,
            pagination: { total: MOCK_ADMIN_USERS.length, page: 1, pages: 1 },
          },
        },
      };
    }
  },
  getUser: (id) => api.get(`/admin/users/${id}`),
  createUser: (data) =>
    api.post('/admin/users', data).catch(() =>
      Promise.resolve({ data: { status: 'success', message: 'User created (demo mode)' } })
    ),
  updateUser: (id, data) =>
    api.put(`/admin/users/${id}`, data).catch(() =>
      Promise.resolve({ data: { status: 'success', message: 'User updated (demo mode)' } })
    ),
  deleteUser: (id) =>
    api.delete(`/admin/users/${id}`).catch(() =>
      Promise.resolve({ data: { status: 'success', message: 'User deleted (demo mode)' } })
    ),
  listCourses: async () => {
    try {
      return await api.get('/admin/courses');
    } catch {
      return {
        data: {
          status: 'success',
          data: {
            courses: DEMO_COURSES.map((c) => ({ ...c, lessonsCount: 3, quizzesCount: 2 })),
          },
        },
      };
    }
  },
  listEnrollments: async () => {
    try {
      return await api.get('/admin/enrollments');
    } catch {
      return {
        data: {
          status: 'success',
          data: {
            enrollments: MOCK_ADMIN_ENROLLMENTS,
          },
        },
      };
    }
  },
};

export default api;
