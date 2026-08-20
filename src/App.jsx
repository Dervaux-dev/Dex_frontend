import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/home';
import CourseList from './components/courselist';
import CourseDetail from './components/coursedetail';
import Login from './components/login';
import Register from './components/register';
import Dashboard from './components/dashboard';
import AdminLessons from './components/AdminLessons';
import AdminDashboard from './components/AdminDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/courses" element={<CourseList />} />
        <Route path="/courses/:id" element={<CourseDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/lessons" element={<AdminLessons />} />
      </Routes>
    </Router>
  );
}

export default App;