import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

/**
 * LoginPage component allowing users to log in by name and password.
 * Provides authentication interface with form validation and role-based redirection.
 */
export default function LoginPage() {
  const { login, loginError } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [password, setPassword] = useState('');

  // Apply special layout class for login page
  useEffect(() => {
    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.classList.add('login-page-layout');
    }
    
    // Cleanup when component unmounts
    return () => {
      if (rootElement) {
        rootElement.classList.remove('login-page-layout');
      }
    };
  }, []);

  /**
   * Handles form submission to perform login and redirect based on role.
   * Authenticates user and navigates to appropriate dashboard.
   * 
   * @param {Event} e - Form submission event
   */
  async function handleSubmit(e) {
    e.preventDefault();
    const userData = await login({ name, password });
    if (userData) {
      if (userData.role === 'teacher') {
        navigate('/teacher');
      } else {
        navigate('/student');
      }
    }
  }

  return (
    <div className="login-page">
      <div className="form-container">
        <h2 className="text-center">Login</h2>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="name">Username</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your username"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="primary-button">Login</button>
          </div>

          {loginError && <p className="error">{loginError}</p>}
        </form>
      </div>
    </div>
  );
}
