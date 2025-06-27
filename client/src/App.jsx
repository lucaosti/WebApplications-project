import './App.css';
import { AuthProvider } from './auth/AuthContext.jsx';
import AppRouter from './router.jsx';

/**
 * Main application component.
 * Wraps the router inside the authentication context.
 */
export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}
