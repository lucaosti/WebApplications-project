import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import { useEffect, useState } from 'react';
import { apiFetch } from '../api/client.js';

/**
 * AssignmentView shows full details of an assignment.
 * Students can submit and edit the group answer. Teachers can evaluate.
 */
export default function AssignmentView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [assignment, setAssignment] = useState(null);
  const [answer, setAnswer] = useState('');
  const [score, setScore] = useState('');
  const [error, setError] = useState(null);

  // Load assignment details on mount
  useEffect(() => {
    async function loadAssignment() {
      try {
        const res = await apiFetch(`/api/assignments/${id}`);
        if (!res.ok) {
          const err = await res.json();
          setError(err.error || 'Failed to load assignment');
          return;
        }

        const data = await res.json();
        setAssignment(data);
        setAnswer(data.answer || '');
        setScore(data.score || '');
      } catch {
        setError('Network error');
      }
    }

    loadAssignment();
  }, [id]);

  async function handleSubmitAnswer(e) {
    e.preventDefault();
    setError(null);

    try {
      const res = await apiFetch(`/api/assignments/${id}/answer`, {
        method: 'PUT',
        body: JSON.stringify({ answer }),
      });

      if (res.ok) {
        const updated = await res.json();
        setAssignment(updated);
      } else if (res.status === 409) {
        const err = await res.json();
        setAssignment(err.assignment);
        setAnswer(err.assignment.answer || '');
        setError('Assignment was closed before your submission.');
      } else {
        const err = await res.json();
        setError(err.error || 'Failed to submit answer');
      }
    } catch {
      setError('Network error');
    }
  }

  async function handleEvaluate(e) {
    e.preventDefault();
    setError(null);

    try {
      const res = await apiFetch(`/api/assignments/${id}/evaluate`, {
        method: 'PUT',
        body: JSON.stringify({ score, expectedAnswer: assignment.answer || '' }),
      });

      if (res.ok) {
        const updated = await res.json();
        setAssignment(updated);
      } else if (res.status === 409) {
        const err = await res.json();
        setAssignment(err.assignment);
        setAnswer(err.assignment.answer || '');
        setError('Answer was updated by students. Please review again.');
      } else {
        const err = await res.json();
        setError(err.error || 'Failed to evaluate assignment');
      }
    } catch {
      setError('Network error');
    }
  }

  if (!assignment) return <p>Loading assignment...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="assignment-view">
      <button onClick={() => navigate(-1)}>← Back</button>

      <h2>Assignment #{assignment.id}</h2>
      <p><strong>Question:</strong> {assignment.question}</p>
      <p><strong>Teacher:</strong> {assignment.teacherName || 'Unknown'}</p>

      <p><strong>Group Members:</strong> {assignment.groupMembers?.map(m => m.studentName).join(', ')}</p>

      {user.role === 'student' && (
        <form onSubmit={handleSubmitAnswer}>
          <label>Group Answer:</label>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            disabled={assignment.status === 'closed'}
            required
          />
          <button type="submit" disabled={assignment.status === 'closed'}>
            Submit Answer
          </button>
        </form>
      )}

      {user.role === 'teacher' && (
        <form onSubmit={handleEvaluate}>
          <label>Submitted Answer:</label>
          <p>{assignment.answer || 'No answer submitted yet.'}</p>

          <label>Score (0–30):</label>
          <input
            type="number"
            min="0"
            max="30"
            value={score}
            onChange={(e) => setScore(e.target.value)}
            required
          />
          <button type="submit">Evaluate</button>
        </form>
      )}

      {assignment.score && (
        <p><strong>Score:</strong> {assignment.score}</p>
      )}

      {assignment.status === 'closed' && (
        <p><em>This assignment is closed.</em></p>
      )}
    </div>
  );
}
