/**
 * Sortable table component for displaying student class status.
 * Provides clickable headers for sorting and displays data in a responsive table.
 * Integrates with useTableSort hook for sorting functionality.
 * 
 * @param {Array} data - Array of objects to display in the table
 * @param {Array} columns - Array of column definition objects
 * @param {string} sortField - Currently active sort field
 * @param {string} sortDirection - Current sort direction ('asc' or 'desc')
 * @param {Function} onSort - Callback function when header is clicked
 */
export default function SortableTable({ 
  data, 
  columns, 
  sortField, 
  sortDirection, 
  onSort 
}) {
  /**
   * Get the sort indicator arrow for table headers.
   * Shows up/down arrows based on current sort state.
   * 
   * @param {string} field - The field to check for sort indicator
   * @returns {string} Empty string or arrow character
   */
  const getSortArrow = (field) => {
    if (sortField !== field) return '';
    return sortDirection === 'asc' ? ' ↑' : ' ↓';
  };

  return (
    <div className="table-container">
      <table className="class-status-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th 
                key={column.field}
                onClick={() => onSort(column.field)}
                className="sortable-header"
                style={{ cursor: 'pointer' }}
              >
                {column.label}{getSortArrow(column.field)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={row.id || index}>
              {columns.map((column) => (
                <td key={column.field}>
                  {column.render ? column.render(row) : row[column.field]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
