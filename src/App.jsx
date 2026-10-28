import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Performance: Route-level code splitting (lazy loading)
// Heavy routes like Admin, CourseDetail, and Dashboards load on-demand
const Home = lazy(() => import('./components/home'));
const CourseList = lazy(() => import('./components/courselist'));
const CourseDetail = lazy(() => import('./components/coursedetail'));
const Login = lazy(() => import('./components/login'));
const Register = lazy(() => import('./components/register'));
const ForgotPassword = lazy(() => import('./components/forgotpassword'));
const ResetPassword = lazy(() => import('./components/resetpassword'));
const Dashboard = lazy(() => import('./components/dashboard'));
const AdminLessons = lazy(() => import('./components/AdminLessons'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));

const PageLoadingFallback = () => (
  <div style={{
    minHeight: '60vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    color: '#7c3aed',
    fontFamily: "'Fredoka', sans-serif",
    fontSize: '1.25rem',
    fontWeight: '600'
  }}>
    <span style={{ fontSize: '2.4rem', animation: 'bounce 1s infinite' }}>🎈</span>
    <span>Loading Dex Elearning...</span>
  </div>
);

function App() {
  return (
    <Router>
      <div className="app-layout">
        <Navbar />
        <main className="main-content">
          <Suspense fallback={<PageLoadingFallback />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/courses" element={<CourseList />} />
              <Route path="/courses/:id" element={<CourseDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/lessons" element={<AdminLessons />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
