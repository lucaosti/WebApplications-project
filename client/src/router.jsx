import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './auth/AuthContext';

import LoginPage from './auth/LoginPage.jsx';
import StudentDashboard from './pages/StudentDashboard.jsx';
import TeacherDashboard from './pages/TeacherDashboard.jsx';
import AssignmentView from './pages/AssignmentView.jsx';
import CreateAssignment from './pages/CreateAssignment.jsx';

/**
 * Component to redirect logged-in users away from login page
 */
function RedirectIfAuthenticated({ children }) {
  const { isAuthenticated, user } = useAuth();

  if (user === undefined) {
    // Still loading session
    return null;
  }

  if (isAuthenticated) {
    // Redirect to appropriate dashboard based on role
    if (user.role === 'teacher') {
      return <Navigate to="/teacher" replace />;
    } else if (user.role === 'student') {
      return <Navigate to="/student" replace />;
    }
  }

  return children;
}

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
      <Route 
        path="/login" 
        element={
          <RedirectIfAuthenticated>
            <LoginPage />
          </RedirectIfAuthenticated>
        } 
      />

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
      
      {/* Root route - redirect to appropriate dashboard */}
      <Route 
        path="/" 
        element={
          <RequireAuth>
            {user?.role === 'teacher' ? (
              <Navigate to="/teacher" replace />
            ) : (
              <Navigate to="/student" replace />
            )}
          </RequireAuth>
        } 
      />
    </Routes>
  );
}
