import { useState, useEffect } from 'react';
import { apiFetch } from '../api/client.js';

/**
 * Custom hook for managing dashboard data loading from multiple API endpoints.
 * Fetches data from multiple endpoints in parallel and manages loading/error states.
 * 
 * @param {Object} endpoints - Object mapping keys to API endpoint URLs
 * @returns {Object} Object containing data, loading state, error state, and refetch function
 */
export function useDashboardData(endpoints) {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Load data from all specified endpoints in parallel.
   * Updates state with combined results or error information.
   */
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Create promises for all endpoint requests
      const promises = Object.entries(endpoints).map(async ([key, endpoint]) => {
        const result = await apiFetch(endpoint);
        return [key, result];
      });
      
      // Wait for all requests to complete
      const results = await Promise.all(promises);
      const newData = Object.fromEntries(results);
      
      setData(newData);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  // Load data when component mounts
  useEffect(() => {
    loadData();
  }, []);

  return { data, loading, error, refetch: loadData };
}
