import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

/**
 * LoginPage component allowing users to log in by name and password.
 */
export default function LoginPage() {
  const { login, loginError } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [password, setPassword] = useState('');

  /**
   * Handles form submission to perform login and redirect based on role.
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
      <h2>Login</h2>
      <form onSubmit={handleSubmit} className="login-form">
        <div>
          <label htmlFor="name">Username</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit">Login</button>

        {loginError && <p className="error">{loginError}</p>}
      </form>
    </div>
  );
}
