import { useAuth } from '../auth';

/**
 * Navigation component with logout functionality.
 * Displays user information and provides logout button when user is authenticated.
 */
export default function Navigation() {
  const { user, logout } = useAuth();

  // Don't show navigation if not logged in
  if (!user) return null; 

  /**
   * Handle logout button click.
   * Calls the logout function from auth context.
   */
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
