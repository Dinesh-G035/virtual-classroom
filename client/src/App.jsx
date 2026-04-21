import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './components/common/Toast';
import DashboardLayout from './layouts/DashboardLayout';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Teacher pages
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import UploadVideo from './pages/teacher/UploadVideo';
import MyVideos from './pages/teacher/MyVideos';
import VideoAnalytics from './pages/teacher/VideoAnalytics';
import TeacherAnalyticsIndex from './pages/teacher/TeacherAnalyticsIndex';

// Student pages
import StudentDashboard from './pages/student/StudentDashboard';
import WatchVideo from './pages/student/WatchVideo';
import MyFeedback from './pages/student/MyFeedback';
import BrowseVideos from './pages/student/BrowseVideos';

// Protected route wrapper
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-bg-subtle">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-3 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mb-4" />
          <p className="text-surface-400 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to={user?.role === 'teacher' ? '/teacher' : '/student'} replace />;
  }

  return children;
};

// Public route — redirect if already logged in
const PublicRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-bg-subtle">
        <div className="w-12 h-12 mx-auto border-3 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={user?.role === 'teacher' ? '/teacher' : '/student'} replace />;
  }

  return children;
};

// Root redirect based on role
const RootRedirect = () => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) return null;

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return <Navigate to={user?.role === 'teacher' ? '/teacher' : '/student'} replace />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Root */}
            <Route path="/" element={<RootRedirect />} />

            {/* Public auth routes */}
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

            {/* Teacher routes */}
            <Route
              element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/teacher" element={<TeacherDashboard />} />
              <Route path="/teacher/upload" element={<UploadVideo />} />
              <Route path="/teacher/my-videos" element={<MyVideos />} />
              <Route path="/teacher/analytics" element={<TeacherAnalyticsIndex />} />
              <Route path="/teacher/video/:videoId" element={<VideoAnalytics />} />
            </Route>

            {/* Student routes */}
            <Route
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/student" element={<StudentDashboard />} />
              <Route path="/student/videos" element={<BrowseVideos />} />
              <Route path="/student/watch/:videoId" element={<WatchVideo />} />
              <Route path="/student/my-feedback" element={<MyFeedback />} />
            </Route>

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
