import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import { apiFetch } from '../api/client.js';

/**
 * StudentDashboard displays the assignments assigned to the logged-in student,
 * along with their weighted average score.
 */
export default function StudentDashboard() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [average, setAverage] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  /**
   * Fetch student's assignments and average score when component mounts.
   */
  useEffect(() => {
    /**
     * Load student dashboard data including assignments and average score.
     * Handles both assignment list and average score calculation.
     */
    const loadDashboard = async () => {
      try {
        const [assignments, averageData] = await Promise.all([
          apiFetch('/api/assignments'),
          apiFetch('/api/student/average')
        ]);

        // Handle assignments
        setAssignments(Array.isArray(assignments) ? assignments : []);

        // Handle average score
        if (averageData && averageData.average !== undefined) {
          setAverage(averageData.average);
        }
      } catch (err) {
        console.error('Error loading dashboard:', err);
        setError(err.message || 'Network error');
      }
    };

    loadDashboard();
  }, []);

  // Separate assignments by status
  const openAssignments = assignments.filter(a => a.status === 'open');
  const closedAssignments = assignments.filter(a => a.status === 'closed');

  // Calculate summary statistics
  const totalAssignments = assignments.length;
  const totalOpen = openAssignments.length;
  const totalClosed = closedAssignments.length;

  return (
    <div className="dashboard">
      <h2>Student Dashboard</h2>

      {error && <p className="error">{error}</p>}

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
                      {a.answer ? <span> • Answer submitted</span> : <span> • No answer submitted</span>}
                    </p>
                  </div>
                  <div className="group-members">
                    <p><strong>Teacher:</strong> {a.teacherName || 'Unknown'}</p>
                    <p><strong>Teammates:</strong> {
                      a.groupMembers?.filter(m => m.name !== user?.name).map(m => m.name).join(', ') || 'No teammates'
                    }</p>
                  </div>
                </div>
                <button onClick={() => navigate(`/assignment/${a.id}`)} className="secondary-button assignment-button">
                  {a.answer ? 'View/Edit' : 'Submit Answer'}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Summary Statistics */}
      <div className="form-container mb-lg">
        <h3>Your Progress Summary</h3>
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
            <h4>{average !== null ? average.toFixed(2) : 'N/A'}</h4>
            <p>Average Score</p>
          </div>
        </div>
      </div>

      {/* Closed Assignments Section */}
      <h3>Completed Assignments ({totalClosed})</h3>
      <div className="list-container">
        {closedAssignments.length === 0 ? (
          <p>No completed assignments yet.</p>
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
                    <p><strong>Teacher:</strong> {a.teacherName || 'Unknown'}</p>
                    <p><strong>Teammates:</strong> {
                      a.groupMembers?.filter(m => m.name !== user?.name).map(m => m.name).join(', ') || 'No teammates'
                    }</p>
                  </div>
                </div>
                <button onClick={() => navigate(`/assignment/${a.id}`)} className="secondary-button assignment-button">
                  View Results
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
