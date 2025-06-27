import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './auth/AuthContext';

import LoginPage from './auth/LoginPage.jsx';
import StudentDashboard from './pages/StudentDashboard.jsx';
import TeacherDashboard from './pages/TeacherDashboard.jsx';
import AssignmentView from './pages/AssignmentView.jsx';
import CreateAssignment from './pages/CreateAssignment.jsx';

/**
 * Component to restrict access to authenticated users.
 * Redirects to /login if user is not logged in.
 */
function RequireAuth({ children }) {
  const { isAuthenticated, user } = useAuth();

  if (user === undefined) {
    // Still loading session
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

/**
 * Main routing component for the application.
 */
export default function AppRouter() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/student"
        element={
          <RequireAuth>
            {user?.role === 'student' ? (
              <StudentDashboard />
            ) : (
              <Navigate to="/teacher" replace />
            )}
          </RequireAuth>
        }
      />

      <Route
        path="/teacher"
        element={
          <RequireAuth>
            {user?.role === 'teacher' ? (
              <TeacherDashboard />
            ) : (
              <Navigate to="/student" replace />
            )}
          </RequireAuth>
        }
      />

      <Route
        path="/teacher/create"
        element={
          <RequireAuth>
            {user?.role === 'teacher' ? (
              <CreateAssignment />
            ) : (
              <Navigate to="/student" replace />
            )}
          </RequireAuth>
        }
      />

      <Route
        path="/assignment/:id"
        element={
          <RequireAuth>
            <AssignmentView />
          </RequireAuth>
        }
      />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
