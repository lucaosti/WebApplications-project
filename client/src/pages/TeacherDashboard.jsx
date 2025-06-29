import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import { apiFetch } from '../api/client.js';

/**
 * TeacherDashboard component.
 * Displays the teacher's assignments and overall statistics
 * for students in the teacher's class.
 */
export default function TeacherDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [assignments, setAssignments] = useState([]);
  const [classStatus, setClassStatus] = useState([]);
  const [error, setError] = useState(null);
  
  // State for table sorting
  const [sortField, setSortField] = useState('avgScore'); // Default sort by average score
  const [sortDirection, setSortDirection] = useState('desc'); // Descending for avg score

  /**
   * Fetch both the teacher's assignments and the class status on initial mount.
   */
  useEffect(() => {
    /**
     * Load teacher dashboard data including assignments and class status.
     * Fetches assignments created by the teacher and per-student statistics.
     */
    const loadData = async () => {
      try {
        // Fetch assignments created by the current teacher
        const assignmentsResponse = await apiFetch('/api/assignments');
        setAssignments(Array.isArray(assignmentsResponse) ? assignmentsResponse : []);

        // Fetch per-student statistics (used in the table below)
        const statusResponse = await apiFetch('/api/teacher/class-status');
        setClassStatus(Array.isArray(statusResponse) ? statusResponse : []);
      } catch (err) {
        setError(err.message || 'Network error');
      }
    };

    loadData();
  }, []);

  /**
   * Handle table column header click for sorting.
   * @param {string} field - The field to sort by
   */
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

  /**
   * Sort the class status data based on current sort field and direction.
   */
  const sortedClassStatus = [...classStatus].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];
    
    // Handle null values for avgScore
    if (sortField === 'avgScore') {
      aVal = aVal === null ? -1 : aVal;
      bVal = bVal === null ? -1 : bVal;
    }
    
    // Handle string sorting (studentName)
    if (typeof aVal === 'string') {
      return sortDirection === 'asc' 
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }
    
    // Handle numeric sorting
    if (sortDirection === 'asc') {
      return aVal - bVal;
    } else {
      return bVal - aVal;
    }
  });

  /**
   * Get the sort indicator arrow for table headers.
   * @param {string} field - The field to check
   * @returns {string} - Arrow character or empty string
   */
  const getSortIndicator = (field) => {
    if (sortField !== field) return '';
    return sortDirection === 'asc' ? ' ↑' : ' ↓';
  };

  // Separate assignments by status
  const openAssignments = assignments.filter(a => a.status === 'open');
  const closedAssignments = assignments.filter(a => a.status === 'closed');

  // Calculate summary statistics
  const totalAssignments = assignments.length;
  const totalOpen = openAssignments.length;
  const totalClosed = closedAssignments.length;
  
  // Calculate weighted average score for closed assignments
  const averageScore = closedAssignments.length > 0 
    ? (() => {
        const totalWeightedScore = closedAssignments.reduce((sum, a) => {
          const groupSize = a.groupMembers?.length || 1;
          return sum + (a.score || 0) / groupSize;
        }, 0);
        const totalWeight = closedAssignments.reduce((sum, a) => {
          const groupSize = a.groupMembers?.length || 1;
          return sum + 1 / groupSize;
        }, 0);
        return totalWeight > 0 ? (totalWeightedScore / totalWeight).toFixed(2) : 'N/A';
      })()
    : 'N/A';

  return (
    <div className="dashboard">
      <h2>Teacher Dashboard</h2>

      {/* Display global error if any */}
      {error && <p className="error">{error}</p>}

      {/* Button to create a new assignment */}
      <button onClick={() => navigate('/teacher/create')} className="primary-button mb-lg">
        Add New Assignment
      </button>

      {/* Open Assignments Section */}
      <h3>Open Assignments ({totalOpen})</h3>
      <div className="list-container">
        {openAssignments.length === 0 ? (
          <p>No open assignments.</p>
        ) : (
          <ul className="assignment-list">
            {openAssignments.map((a) => (
              <li key={a.id} className="assignment-card">
                <div className="assignment-content">
                  <div className="assignment-main">
                    <h4>{a.question}</h4>
                    <p><strong>Status:</strong> {a.status} 
                      {a.answer && a.answer.trim() !== '' && <span> • Answer submitted</span>}
                    </p>
                  </div>
                  <div className="group-members">
                    <p><strong>Group Members:</strong></p>
                    <p>{a.groupMembers?.map(m => m.name).join(', ') || 'No members'}</p>
                  </div>
                </div>
                <button onClick={() => navigate(`/assignment/${a.id}`)} className="secondary-button assignment-button">
                  {a.answer && a.answer.trim() !== '' ? 'Evaluate' : 'View'}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Summary Statistics */}
      <div className="form-container mb-lg">
        <h3>Summary Statistics</h3>
        <div className="stats-grid">
          <div className="stats-item">
            <h4>{totalAssignments}</h4>
            <p>Total Assignments</p>
          </div>
          <div className="stats-item">
            <h4>{totalOpen}</h4>
            <p>Open</p>
          </div>
          <div className="stats-item">
            <h4>{totalClosed}</h4>
            <p>Closed</p>
          </div>
          <div className="stats-item">
            <h4>{averageScore}</h4>
            <p>Average Score</p>
          </div>
        </div>
      </div>

      {/* Closed Assignments Section */}
      <h3>Closed Assignments ({totalClosed})</h3>
      <div className="list-container">
        {closedAssignments.length === 0 ? (
          <p>No closed assignments yet.</p>
        ) : (
          <ul className="assignment-list">
            {closedAssignments.map((a) => (
              <li key={a.id} className="assignment-card">
                <div className="assignment-content">
                  <div className="assignment-main">
                    <h4>{a.question}</h4>
                    <p><strong>Status:</strong> {a.status} 
                      {a.score && <span> • Score: {a.score}/30</span>}
                    </p>
                  </div>
                  <div className="group-members">
                    <p><strong>Group Members:</strong></p>
                    <p>{a.groupMembers?.map(m => m.name).join(', ') || 'No members'}</p>
                  </div>
                </div>
                <button onClick={() => navigate(`/assignment/${a.id}`)} className="secondary-button assignment-button">
                  View Details
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <h2>Class Status</h2>

      {/* Table of per-student stats, shown only if data is present */}
      {classStatus.length === 0 ? (
        <p>No student data available yet.</p>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th onClick={() => handleSort('studentName')}>Student {getSortIndicator('studentName')}</th>
                <th onClick={() => handleSort('avgScore')}>Avg. Score {getSortIndicator('avgScore')}</th>
                <th onClick={() => handleSort('numOpen')}>Open {getSortIndicator('numOpen')}</th>
                <th onClick={() => handleSort('numClosed')}>Closed {getSortIndicator('numClosed')}</th>
              </tr>
            </thead>
            <tbody>
              {sortedClassStatus.map((s) => (
                <tr key={s.studentId}>
                  <td>{s.studentName}</td>
                  <td>{s.avgScore !== null ? s.avgScore.toFixed(2) : '-'}</td>
                  <td>{s.numOpen}</td>
                  <td>{s.numClosed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
