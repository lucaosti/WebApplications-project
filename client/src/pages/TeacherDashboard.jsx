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

  /**
   * Fetch both the teacher's assignments and the class status on initial mount.
   */
  useEffect(() => {
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

  return (
    <div className="dashboard">
      <h2>Welcome, Prof. {user?.name}</h2>

      <h3>Your Assignments</h3>

      {/* Display global error if any */}
      {error && <p className="error">{error}</p>}

      {/* Button to create a new assignment */}
      <button onClick={() => navigate('/teacher/create')}>
        Add New Assignment
      </button>

      {/* List of assignments created by the teacher */}
      <ul className="assignment-list">
        {assignments.map((a) => (
          <li key={a.id} className="assignment-card">
            <h4>{a.question}</h4>
            <p>Status: {a.status}</p>
            <button onClick={() => navigate(`/assignment/${a.id}`)}>
              View / Edit
            </button>
          </li>
        ))}
      </ul>

      <h3>Class Status</h3>

      {/* Table of per-student stats, shown only if data is present */}
      {classStatus.length === 0 ? (
        <p>No student data available yet.</p>
      ) : (
        <table className="class-status-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Avg. Score</th>
              <th>Open</th>
              <th>Closed</th>
            </tr>
          </thead>
          <tbody>
            {classStatus.map((s) => (
              <tr key={s.studentId}>
                <td>{s.studentName}</td>
                <td>{s.avgScore !== null ? s.avgScore.toFixed(1) : '-'}</td>
                <td>{s.numOpen}</td>
                <td>{s.numClosed}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
