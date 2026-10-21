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
    const status = error.response?.status;
    const url = error.config?.url || '';
    const isAuthCheck = url.includes('/users/profile');

    // A 401 from the background profile check must never force a redirect;
    // AuthContext handles clearing the session itself.
    if (status === 401 && !isAuthCheck) {
      const isAdminArea = window.location.pathname.startsWith('/admin');
      const isAuthPage =
        window.location.pathname.includes('/login') ||
        window.location.pathname.includes('/register');
      if (!isAdminArea && !isAuthPage) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/register', data),
  login: (credentials) => api.post('/login', credentials),
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
