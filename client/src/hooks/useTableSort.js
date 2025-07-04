import { useState } from 'react';

/**
 * Custom hook for managing table sorting functionality.
 * Handles sort field, direction, and provides sorting logic for table data.
 * 
 * @param {string} initialField - Initial field to sort by
 * @param {string} initialDirection - Initial sort direction ('asc' or 'desc')
 * @returns {Object} Object containing sort state and functions
 */
export function useTableSort(initialField = 'id', initialDirection = 'asc') {
  const [sortField, setSortField] = useState(initialField);
  const [sortDirection, setSortDirection] = useState(initialDirection);

  /**
   * Handle clicking on a table header to change sort order.
   * Toggles direction if same field, or sets new field with default direction.
   * 
   * @param {string} field - The field name to sort by
   */
  const handleSort = (field) => {
    if (sortField === field) {
      // Same field clicked, toggle direction
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New field selected, set default direction based on field type
      setSortField(field);
      setSortDirection(field === 'avgScore' ? 'desc' : 'asc');
    }
  };

  /**
   * Sort array of data based on current sort field and direction.
   * Handles special calculated fields and numeric/string comparison.
   * 
   * @param {Array} data - Array of objects to sort
   * @returns {Array} Sorted array
   */
  const sortData = (data) => {
    return [...data].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      
      // Handle calculated fields that don't exist in the data objects
      if (sortField === 'total') {
        aVal = a.numOpen + a.numClosed;
        bVal = b.numOpen + b.numClosed;
      }
      
      // Handle null values for avgScore (treat null as lowest value)
      if (sortField === 'avgScore') {
        aVal = aVal === null ? -1 : aVal;
        bVal = bVal === null ? -1 : bVal;
      }
      
      // Handle string values with locale-aware comparison
      if (typeof aVal === 'string') {
        return sortDirection === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      
      // Handle numeric values
      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    });
  };

  return {
    sortField,
    sortDirection,
    handleSort,
    sortData
  };
}
