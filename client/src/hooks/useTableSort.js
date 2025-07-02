/**
 * Custom hook for managing table sorting
 */
import { useState } from 'react';

export function useTableSort(initialField = 'id', initialDirection = 'asc') {
  const [sortField, setSortField] = useState(initialField);
  const [sortDirection, setSortDirection] = useState(initialDirection);

  const handleSort = (field) => {
    if (sortField === field) {
      // Same field, toggle direction
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, set default direction
      setSortField(field);
      setSortDirection(field === 'avgScore' ? 'desc' : 'asc');
    }
  };

  const sortData = (data) => {
    return [...data].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      
      // Handle calculated fields
      if (sortField === 'total') {
        aVal = a.numOpen + a.numClosed;
        bVal = b.numOpen + b.numClosed;
      }
      
      // Handle null values for avgScore
      if (sortField === 'avgScore') {
        aVal = aVal === null ? -1 : aVal;
        bVal = bVal === null ? -1 : bVal;
      }
      
      // Handle string sorting
      if (typeof aVal === 'string') {
        return sortDirection === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      
      // Handle numeric sorting
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
