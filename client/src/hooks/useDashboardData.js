/**
 * Custom hook for managing dashboard data loading
 */
import { useState, useEffect } from 'react';
import { apiFetch } from '../api/client.js';

export function useDashboardData(endpoints) {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const promises = Object.entries(endpoints).map(async ([key, endpoint]) => {
        const result = await apiFetch(endpoint);
        return [key, result];
      });
      
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

  useEffect(() => {
    loadData();
  }, []);

  return { data, loading, error, refetch: loadData };
}
