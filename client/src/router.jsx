import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth, LoginPage } from './auth';
import { StudentDashboard, TeacherDashboard, AssignmentView, CreateAssignment } from './pages';

/**
 * Component to redirect logged-in users away from login page.
 * Prevents authenticated users from accessing the login page.
 */
function RedirectIfAuthenticated({ children }) {
  const { isAuthenticated, user } = useAuth();

  // Wait for session loading to complete
  if (user === undefined) {
    return null;
  }

  if (isAuthenticated) {
    // Redirect to appropriate dashboard based on user role
    if (user.role === 'teacher') {
      return <Navigate to="/teacher" replace />;
    } else if (user.role === 'student') {
      return <Navigate to="/student" replace />;
    }
  }

  return children;
}

/**
 * Component to restrict access to authenticated users only.
 * Redirects unauthenticated users to the login page.
 */
function RequireAuth({ children }) {
  const { isAuthenticated, user } = useAuth();

  // Wait for session loading to complete
  if (user === undefined) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

/**
 * Main routing component for the application.
 * Defines all routes and handles role-based access control.
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

      {/* Catch-all route - redirect to root which handles authentication */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
