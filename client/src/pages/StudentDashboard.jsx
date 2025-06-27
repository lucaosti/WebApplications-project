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
    const loadDashboard = async () => {
      try {
        const [resAssignments, resAverage] = await Promise.all([
          apiFetch('/api/assignments'),
          apiFetch('/api/student/average')
        ]);

        // Handle assignments
        if (resAssignments.ok) {
          const data = await resAssignments.json();
          setAssignments(data);
        } else {
          const err = await resAssignments.json();
          setError(err.error || 'Failed to load assignments');
        }

        // Handle average score
        if (resAverage.ok) {
          const data = await resAverage.json();
          setAverage(data.average);
        }
        // No catch for resAverage error: average is optional
      } catch {
        setError('Network error');
      }
    };

    loadDashboard();
  }, []);

  return (
    <div className="dashboard">
      <h2>Welcome, {user?.name}</h2>

      <h4>
        {average !== null
          ? `Your average score: ${average.toFixed(1)}`
          : `You haven't received any scores yet.`}
      </h4>

      <h3>Your Assignments</h3>

      {error && <p className="error">{error}</p>}

      <ul className="assignment-list">
        {assignments.map((a) => (
          <li key={a.id} className="assignment-card">
            <h4>{a.question}</h4>
            <p>Status: {a.status}</p>
            <button onClick={() => navigate(`/assignment/${a.id}`)}>
              View
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
