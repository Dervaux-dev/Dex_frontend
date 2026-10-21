import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI, coursesAPI, lessonsAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import './AdminDashboard.css';

const TABS = [
  { key: 'overview', label: 'Overview', icon: '📊' },
  { key: 'users', label: 'Users', icon: '👥' },
  { key: 'courses', label: 'Courses', icon: '📚' },
  { key: 'lessons', label: 'Lessons & Quizzes', icon: '📝' },
  { key: 'enrollments', label: 'Enrollments', icon: '🎓' },
];

const AdminDashboard = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  if (!user || !isAdmin) {
    return (
      <div className="admin-gateway-overlay">
        <div className="admin-gateway-card">
          <div className="gateway-badge-pill">🛡️ Administrator Access</div>
          <h2 className="gateway-title">DexElearning Admin Portal</h2>
          <p className="gateway-sub">
            Administrative management console for Digital Arts. Manage students, curriculum grade levels, PDF study lessons, and AI-graded quizzes.
          </p>

          <p className="gateway-note">
            Admin accounts are created manually. Sign in with the administrator email and password issued to you.
          </p>

          <div className="gateway-actions">
            <button className="gateway-login-btn" onClick={() => navigate('/login')}>
              🔐 Sign In as Administrator
            </button>
          </div>

          <div className="gateway-meta-footer">
            <p>Leadership: <strong>NZANYWAYIMANA Ineza Yves Delvo</strong> (CEO) &bull; Rwanda 🇷🇼</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <div className="admin-header-left">
          <h1>Admin Portal</h1>
          <p className="admin-header-sub">Manage your DexElearning platform</p>
        </div>
        <div className="admin-header-right">
          <span className="admin-badge">Admin</span>
          <span className="admin-user-name">{user?.fullname}</span>
        </div>
      </div>

      <div className="admin-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`admin-tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="admin-content">
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'users' && <UsersTab />}
        {activeTab === 'courses' && <CoursesTab />}
        {activeTab === 'lessons' && <LessonsTab />}
        {activeTab === 'enrollments' && <EnrollmentsTab />}
      </div>
    </div>
  );
};

// ── Overview Tab ───────────────────────────────────
const OverviewTab = () => {
  const toast = useToast();
  const [stats, setStats] = useState(null);
  const [loadingState, setLoadingState] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await adminAPI.getStats();
        setStats(res.data.data);
      } catch {
        toast.error('Failed to load dashboard stats');
      } finally {
        setLoadingState(false);
      }
    };
    fetchStats();
  }, [toast]);

  if (loadingState) {
    return <div className="admin-loading"><div className="admin-spinner" /></div>;
  }

  if (!stats) return <div className="admin-empty">Failed to load stats.</div>;

  const s = stats.stats;

  return (
    <div className="overview-tab">
      <div className="stats-grid">
        <StatCard icon="👥" label="Total Users" value={s.totalUsers} color="#7c3aed" />
        <StatCard icon="✅" label="Active Users" value={s.activeUsers} color="#10b981" />
        <StatCard icon="👑" label="Admins" value={s.adminCount} color="#f59e0b" />
        <StatCard icon="📚" label="Courses" value={s.totalCourses} color="#3b82f6" />
        <StatCard icon="📄" label="Lessons" value={s.totalLessons} color="#ec4899" />
        <StatCard icon="🎯" label="Quizzes" value={s.totalQuizzes} color="#8b5cf6" />
        <StatCard icon="🎓" label="Enrollments" value={s.totalEnrollments} color="#14b8a6" />
        <StatCard icon="📝" label="Quiz Attempts" value={s.totalQuizAttempts} color="#f97316" />
      </div>

      <div className="overview-columns">
        <div className="overview-card">
          <h3>Recent Users</h3>
          {stats.recentUsers.length === 0 ? (
            <p className="overview-empty">No users yet</p>
          ) : (
            <ul className="overview-list">
              {stats.recentUsers.map((u) => (
                <li key={u._id}>
                  <span className="list-avatar">{u.fullname?.charAt(0)?.toUpperCase()}</span>
                  <div className="list-info">
                    <span className="list-name">{u.fullname}</span>
                    <span className="list-sub">{u.email}</span>
                  </div>
                  <span className={`list-badge ${u.role}`}>{u.role}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="overview-card">
          <h3>Recent Courses</h3>
          {stats.recentCourses.length === 0 ? (
            <p className="overview-empty">No courses yet</p>
          ) : (
            <ul className="overview-list">
              {stats.recentCourses.map((c) => (
                <li key={c._id}>
                  <span className="list-emoji">📚</span>
                  <div className="list-info">
                    <span className="list-name">{c.title}</span>
                    <span className="list-sub">{c.gradeLevel} · {c.category}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, color }) => (
  <div className="stat-card" style={{ borderLeftColor: color }}>
    <div className="stat-icon" style={{ background: `${color}15`, color }}>{icon}</div>
    <div className="stat-info">
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
    </div>
  </div>
);

// ── Users Tab ──────────────────────────────────────
const UsersTab = () => {
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createData, setCreateData] = useState({ fullname: '', email: '', password: '', role: 'user' });
  const [creating, setCreating] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editData, setEditData] = useState({ fullname: '', email: '', role: 'user', isActive: true, password: '' });
  const [updating, setUpdating] = useState(false);

  const fetchUsers = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await adminAPI.listUsers({ page, limit: 20, search, role: roleFilter });
      setUsers(res.data.data.users);
      setPagination(res.data.data.pagination);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, toast]);

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      try {
        const res = await adminAPI.listUsers({ page: 1, limit: 20, search, role: roleFilter });
        if (!ignore) {
          setUsers(res.data.data.users);
          setPagination(res.data.data.pagination);
        }
      } catch {
        if (!ignore) toast.error('Failed to load users');
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    load();
    return () => { ignore = true; };
  }, [search, roleFilter, toast]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers(1);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await adminAPI.createUser(createData);
      toast.success('Account created successfully');
      setCreateData({ fullname: '', email: '', password: '', role: 'user' });
      setShowCreateForm(false);
      fetchUsers(1);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create account');
    } finally {
      setCreating(false);
    }
  };

  const handleEdit = (u) => {
    setEditingUser(u);
    setEditData({ fullname: u.fullname, email: u.email, role: u.role, isActive: u.isActive, password: '' });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (editData.password && editData.password.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    setUpdating(true);
    try {
      const { password, ...payload } = editData;
      if (password) payload.password = password;
      await adminAPI.updateUser(editingUser._id, payload);
      toast.success('User updated successfully');
      setEditingUser(null);
      fetchUsers(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (u) => {
    if (!window.confirm(`Delete ${u.fullname}? This cannot be undone.`)) return;
    try {
      await adminAPI.deleteUser(u._id);
      toast.success('User deleted');
      fetchUsers(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleToggleActive = async (u) => {
    try {
      await adminAPI.updateUser(u._id, { isActive: !u.isActive });
      toast.success(u.isActive ? 'User deactivated' : 'User activated');
      fetchUsers(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user');
    }
  };

  return (
    <div className="users-tab">
      <div className="tab-toolbar">
        <form className="search-form" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="">All Roles</option>
            <option value="user">Users</option>
            <option value="admin">Admins</option>
          </select>
          <button type="submit" className="toolbar-btn primary">Search</button>
        </form>
        <button
          className="toolbar-btn primary"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? 'Cancel' : '+ Create Account'}
        </button>
      </div>

      {showCreateForm && (
        <div className="create-form-box">
          <h3>Create New Account</h3>
          <form className="create-form" onSubmit={handleCreate}>
            <div className="form-row-2">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={createData.fullname}
                  onChange={(e) => setCreateData({ ...createData, fullname: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  placeholder="john@example.com"
                  value={createData.email}
                  onChange={(e) => setCreateData({ ...createData, email: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="form-row-2">
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  placeholder="Min. 6 characters"
                  value={createData.password}
                  onChange={(e) => setCreateData({ ...createData, password: e.target.value })}
                  required
                  minLength={6}
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select
                  value={createData.role}
                  onChange={(e) => setCreateData({ ...createData, role: e.target.value })}
                >
                  <option value="user">Student</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <button type="submit" className="toolbar-btn primary" disabled={creating}>
              {creating ? 'Creating...' : 'Create Account'}
            </button>
          </form>
        </div>
      )}

      {editingUser && (
        <div className="create-form-box">
          <h3>Edit User: {editingUser.fullname}</h3>
          <form className="create-form" onSubmit={handleUpdate}>
            <div className="form-row-2">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={editData.fullname}
                  onChange={(e) => setEditData({ ...editData, fullname: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={editData.email}
                  onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="form-row-2">
              <div className="form-group">
                <label>Role</label>
                <select
                  value={editData.role}
                  onChange={(e) => setEditData({ ...editData, role: e.target.value })}
                >
                  <option value="user">Student</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="form-group">
                <label>Active</label>
                <select
                  value={editData.isActive ? 'true' : 'false'}
                  onChange={(e) => setEditData({ ...editData, isActive: e.target.value === 'true' })}
                >
                  <option value="true">Active</option>
                  <option value="false">Deactivated</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>New Password <span className="label-optional">(leave blank to keep current)</span></label>
              <input
                type="password"
                placeholder="Min. 6 characters"
                value={editData.password}
                onChange={(e) => setEditData({ ...editData, password: e.target.value })}
                minLength={6}
                autoComplete="new-password"
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="toolbar-btn primary" disabled={updating}>
                {updating ? 'Saving...' : 'Save Changes'}
              </button>
              <button type="button" className="toolbar-btn" onClick={() => setEditingUser(null)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="admin-loading"><div className="admin-spinner" /></div>
      ) : users.length === 0 ? (
        <div className="admin-empty">No users found.</div>
      ) : (
        <>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td>
                      <div className="table-user">
                        <span className="table-avatar">{u.fullname?.charAt(0)?.toUpperCase()}</span>
                        <span className="table-name">{u.fullname}</span>
                      </div>
                    </td>
                    <td>{u.email}</td>
                    <td><span className={`role-badge ${u.role}`}>{u.role}</span></td>
                    <td>
                      <span className={`status-badge ${u.isActive ? 'active' : 'inactive'}`}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="action-btns">
                        <button className="action-btn edit" onClick={() => handleEdit(u)} title="Edit">Edit</button>
                        <button
                          className={`action-btn ${u.isActive ? 'deactivate' : 'activate'}`}
                          onClick={() => handleToggleActive(u)}
                          title={u.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {u.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button className="action-btn delete" onClick={() => handleDelete(u)} title="Delete">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pagination.pages > 1 && (
            <div className="pagination">
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  className={`page-btn ${p === pagination.page ? 'active' : ''}`}
                  onClick={() => fetchUsers(p)}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

// ── Courses Tab ────────────────────────────────────
const CoursesTab = () => {
  const toast = useToast();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createData, setCreateData] = useState({
    title: '', description: '', gradeLevel: 'Primary 1', category: 'mathematics', level: 'beginner',
  });
  const [creating, setCreating] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [editData, setEditData] = useState({});
  const [updating, setUpdating] = useState(false);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminAPI.listCourses();
      setCourses(res.data.data.courses);
    } catch {
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      try {
        const res = await adminAPI.listCourses();
        if (!ignore) setCourses(res.data.data.courses);
      } catch {
        if (!ignore) toast.error('Failed to load courses');
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    load();
    return () => { ignore = true; };
  }, [toast]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await coursesAPI.create({
        ...createData,
        instructor: { name: 'Admin', bio: '' },
      });
      toast.success('Course created successfully');
      setCreateData({ title: '', description: '', gradeLevel: 'Primary 1', category: 'mathematics', level: 'beginner' });
      setShowCreateForm(false);
      fetchCourses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create course');
    } finally {
      setCreating(false);
    }
  };

  const handleEdit = (c) => {
    setEditingCourse(c);
    setEditData({ title: c.title, description: c.description, gradeLevel: c.gradeLevel, category: c.category, level: c.level });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      await coursesAPI.update(editingCourse._id, editData);
      toast.success('Course updated');
      setEditingCourse(null);
      fetchCourses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update course');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (c) => {
    if (!window.confirm(`Delete course "${c.title}"? This will remove all its lessons and quizzes.`)) return;
    try {
      await coursesAPI.delete(c._id);
      toast.success('Course deleted');
      fetchCourses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete course');
    }
  };

  const gradeOptions = ['Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5', 'Primary 6'];
  const categoryOptions = ['mathematics', 'science', 'english', 'social-studies', 'creative-arts', 'ict', 'programming', 'french', 'kinyarwanda', 'music', 'physical-education', 'other'];

  return (
    <div className="courses-tab">
      <div className="tab-toolbar">
        <h3>All Courses ({courses.length})</h3>
        <button className="toolbar-btn primary" onClick={() => setShowCreateForm(!showCreateForm)}>
          {showCreateForm ? 'Cancel' : '+ New Course'}
        </button>
      </div>

      {showCreateForm && (
        <div className="create-form-box">
          <h3>Create New Course</h3>
          <form className="create-form" onSubmit={handleCreate}>
            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                placeholder="Course title"
                value={createData.title}
                onChange={(e) => setCreateData({ ...createData, title: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                placeholder="Course description"
                value={createData.description}
                onChange={(e) => setCreateData({ ...createData, description: e.target.value })}
                rows={3}
                required
              />
            </div>
            <div className="form-row-2">
              <div className="form-group">
                <label>Grade Level</label>
                <select value={createData.gradeLevel} onChange={(e) => setCreateData({ ...createData, gradeLevel: e.target.value })}>
                  {gradeOptions.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Category</label>
                <select value={createData.category} onChange={(e) => setCreateData({ ...createData, category: e.target.value })}>
                  {categoryOptions.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <button type="submit" className="toolbar-btn primary" disabled={creating}>
              {creating ? 'Creating...' : 'Create Course'}
            </button>
          </form>
        </div>
      )}

      {editingCourse && (
        <div className="create-form-box">
          <h3>Edit Course: {editingCourse.title}</h3>
          <form className="create-form" onSubmit={handleUpdate}>
            <div className="form-group">
              <label>Title</label>
              <input type="text" value={editData.title} onChange={(e) => setEditData({ ...editData, title: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea value={editData.description} onChange={(e) => setEditData({ ...editData, description: e.target.value })} rows={3} required />
            </div>
            <div className="form-row-2">
              <div className="form-group">
                <label>Grade Level</label>
                <select value={editData.gradeLevel} onChange={(e) => setEditData({ ...editData, gradeLevel: e.target.value })}>
                  {gradeOptions.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Category</label>
                <select value={editData.category} onChange={(e) => setEditData({ ...editData, category: e.target.value })}>
                  {categoryOptions.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="toolbar-btn primary" disabled={updating}>
                {updating ? 'Saving...' : 'Save Changes'}
              </button>
              <button type="button" className="toolbar-btn" onClick={() => setEditingCourse(null)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="admin-loading"><div className="admin-spinner" /></div>
      ) : courses.length === 0 ? (
        <div className="admin-empty">No courses yet. Create your first course!</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Grade</th>
                <th>Category</th>
                <th>Lessons</th>
                <th>Quizzes</th>
                <th>Enrolled</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((c) => (
                <tr key={c._id}>
                  <td><span className="table-name">{c.title}</span></td>
                  <td><span className="grade-tag">{c.gradeLevel}</span></td>
                  <td>{c.category}</td>
                  <td>{c.lessonCount}</td>
                  <td>{c.quizCount}</td>
                  <td>{c.enrollmentCount}</td>
                  <td>
                    <div className="action-btns">
                      <button className="action-btn edit" onClick={() => handleEdit(c)} title="Edit">Edit</button>
                      <button className="action-btn delete" onClick={() => handleDelete(c)} title="Delete">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// ── Lessons Tab ────────────────────────────────────
const LessonsTab = () => {
  const toast = useToast();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingLessons, setLoadingLessons] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await coursesAPI.getAll();
        const list = res.data.data.courses || [];
        setCourses(list);
        if (list.length > 0) setSelectedCourse(list[0]._id);
      } catch {
        toast.error('Failed to load courses');
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [toast]);

  useEffect(() => {
    if (!selectedCourse) return;
    const fetchLessons = async () => {
      setLoadingLessons(true);
      try {
        const res = await lessonsAPI.getByCourse(selectedCourse);
        setLessons(res.data.data.lessons || []);
      } catch {
        setLessons([]);
      } finally {
        setLoadingLessons(false);
      }
    };
    fetchLessons();
  }, [selectedCourse]);

  if (loading) {
    return <div className="admin-loading"><div className="admin-spinner" /></div>;
  }

  return (
    <div className="lessons-tab">
      <div className="tab-toolbar">
        <h3>Lessons by Course</h3>
        <select
          className="course-select"
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
        >
          {courses.map((c) => (
            <option key={c._id} value={c._id}>{c.title} ({c.gradeLevel})</option>
          ))}
        </select>
      </div>

      <p className="tab-hint">
        To upload new lessons or generate quizzes, go to{' '}
        <a href="/admin/lessons" className="inline-link">Upload PDF & AI Quiz</a>
      </p>

      {loadingLessons ? (
        <div className="admin-loading"><div className="admin-spinner" /></div>
      ) : lessons.length === 0 ? (
        <div className="admin-empty">No lessons for this course yet.</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Chapter</th>
                <th>Title</th>
                <th>PDF</th>
                <th>Summary</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {lessons.map((l) => (
                <tr key={l._id}>
                  <td><span className="chapter-badge">Ch. {l.chapter}</span></td>
                  <td><span className="table-name">{l.title}</span></td>
                  <td>{l.pdfFile || l.pdfUrl ? '✅' : '❌'}</td>
                  <td>{l.summary ? `${l.summary.substring(0, 60)}...` : 'No summary'}</td>
                  <td>{new Date(l.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// ── Enrollments Tab ────────────────────────────────
const EnrollmentsTab = () => {
  const toast = useToast();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const res = await adminAPI.listEnrollments();
        setEnrollments(res.data.data.enrollments || []);
      } catch {
        toast.error('Failed to load enrollments');
      } finally {
        setLoading(false);
      }
    };
    fetchEnrollments();
  }, [toast]);

  return (
    <div className="enrollments-tab">
      <div className="tab-toolbar">
        <h3>All Enrollments ({enrollments.length})</h3>
      </div>

      {loading ? (
        <div className="admin-loading"><div className="admin-spinner" /></div>
      ) : enrollments.length === 0 ? (
        <div className="admin-empty">No enrollments yet.</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Course</th>
                <th>Grade</th>
                <th>Status</th>
                <th>Progress</th>
                <th>Enrolled</th>
              </tr>
            </thead>
            <tbody>
              {enrollments.map((e) => (
                <tr key={e._id}>
                  <td>
                    <div className="table-user">
                      <span className="table-avatar">{e.user?.fullname?.charAt(0)?.toUpperCase()}</span>
                      <span className="table-name">{e.user?.fullname || 'Unknown'}</span>
                    </div>
                  </td>
                  <td>{e.course?.title || 'Unknown'}</td>
                  <td><span className="grade-tag">{e.course?.gradeLevel}</span></td>
                  <td><span className={`status-badge ${e.status === 'active' ? 'active' : 'inactive'}`}>{e.status}</span></td>
                  <td>
                    <div className="progress-mini">
                      <div className="progress-mini-bar">
                        <div className="progress-mini-fill" style={{ width: `${e.progress}%` }} />
                      </div>
                      <span className="progress-mini-text">{e.progress}%</span>
                    </div>
                  </td>
                  <td>{new Date(e.enrolledAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
