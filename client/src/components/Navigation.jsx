import { useAuth } from '../auth/AuthContext.jsx';

/**
 * Navigation component with logout functionality
 */
export default function Navigation() {
  const { user, logout } = useAuth();

  if (!user) return null; // Don't show navigation if not logged in

  const handleLogout = async () => {
    await logout();
  };

  return (
    <nav className="navigation">
      <div className="nav-content">
        <div className="nav-user">
          Welcome, {user.name} ({user.role})
        </div>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>
    </nav>
  );
}
