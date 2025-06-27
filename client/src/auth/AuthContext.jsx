import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiFetch } from '../api/client.js';

// Authentication context
const AuthContext = createContext();

/**
 * AuthProvider component to wrap the app and manage authentication state.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined); // undefined while loading
  const [loginError, setLoginError] = useState(null);

  // Load session on first mount
  useEffect(() => {
    apiFetch('/api/sessions/current')
      .then((userData) => setUser(userData))
      .catch(() => setUser(null));
  }, []);

  /**
   * Perform login with username and password.
   * @returns {Object|null} user info or null on failure
   */
  async function login({ name, password }) {
    setLoginError(null);
    try {
      const userData = await apiFetch('/api/login', {
        method: 'POST',
        body: { name, password }, // body as plain object
      });
      setUser(userData);
      return userData;
    } catch (err) {
      setLoginError(err.message || 'Login failed');
      setUser(null);
      return null;
    }
  }

  /**
   * Perform logout and reset user state.
   */
  async function logout() {
    try {
      await apiFetch('/api/logout', {
        method: 'POST'
      });
    } finally {
      setUser(null);
    }
  }

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    loginError
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Custom hook to access authentication context.
 */
export function useAuth() {
  return useContext(AuthContext);
}
