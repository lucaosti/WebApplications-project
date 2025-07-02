/**
 * Sortable table component for displaying student class status
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
