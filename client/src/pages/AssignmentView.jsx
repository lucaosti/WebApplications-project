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
        const data = await apiFetch(`/api/assignments/${id}`);
        setAssignment(data);
        setAnswer(data.answer || '');
        setScore(data.score || '');
      } catch (err) {
        setError(err.message || 'Failed to load assignment');
      }
    }

    loadAssignment();
  }, [id]);

  /**
   * Handle answer submission by students.
   * Updates the assignment with the provided answer.
   * Handles conflict cases when assignment is closed during submission.
   * @param {Event} e - Form submission event
   */
  async function handleSubmitAnswer(e) {
    e.preventDefault();
    setError(null);

    try {
      const updated = await apiFetch(`/api/assignments/${id}/answer`, {
        method: 'PUT',
        body: { answer },
      });
      setAssignment(updated);
    } catch (err) {
      if (err.status === 409) {
        // Assignment was closed before submission
        try {
          const conflictData = JSON.parse(err.message);
          setAssignment(conflictData.assignment);
          setAnswer(conflictData.assignment.answer || '');
          setError('Assignment was closed before your submission.');
        } catch {
          setError('Assignment was closed before your submission.');
        }
      } else {
        setError(err.message || 'Failed to submit answer');
      }
    }
  }

  /**
   * Handle assignment evaluation by teachers.
   * Assigns a score and closes the assignment.
   * Handles conflict cases when students update answer during evaluation.
   * @param {Event} e - Form submission event
   */
  async function handleEvaluate(e) {
    e.preventDefault();
    setError(null);

    try {
      const updated = await apiFetch(`/api/assignments/${id}/evaluate`, {
        method: 'PUT',
        body: { score, expectedAnswer: assignment.answer || '' },
      });
      setAssignment(updated);
    } catch (err) {
      if (err.status === 409) {
        // Answer was updated by students
        try {
          const conflictData = JSON.parse(err.message);
          setAssignment(conflictData.assignment);
          setAnswer(conflictData.assignment.answer || '');
          setError('Answer was updated by students. Please review again.');
        } catch {
          setError('Answer was updated by students. Please review again.');
        }
      } else {
        setError(err.message || 'Failed to evaluate assignment');
      }
    }
  }

  if (!assignment) return <p>Loading assignment...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="assignment-view">
      <button onClick={() => navigate(-1)} className="secondary-button mb-lg">
        ← Back
      </button>

      <div className="form-container">
        <h2>Assignment #{assignment.id}</h2>
        
        <div className="mb-md">
          <p><strong>Question:</strong> {assignment.question}</p>
          <p><strong>Teacher:</strong> {assignment.teacherName || 'Unknown'}</p>
          <p><strong>Group Members:</strong> {assignment.groupMembers?.map(m => m.studentName).join(', ')}</p>
        </div>

        {user.role === 'student' && (
          <div className="form-group">
            <label>Group Answer:</label>
            {assignment.status === 'closed' ? (
              <div className="form-container p-md" style={{ 
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--bg-hover)',
                marginTop: 'var(--space-sm)'
              }}>
                {answer || 'No answer submitted.'}
              </div>
            ) : (
              <form onSubmit={handleSubmitAnswer}>
                <div className="form-group">
                  <textarea
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Enter your group answer here..."
                    required
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" className="primary-button">
                    Submit Answer
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {user.role === 'teacher' && (
          <div>
            <div className="form-group">
              <p><strong>Submitted Answer:</strong></p>
              <div className="form-container p-md" style={{ 
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--bg-hover)'
              }}>
                {assignment.answer || 'No answer submitted yet.'}
              </div>
            </div>

            {/* Show evaluation section only if an answer has been submitted */}
            {assignment.answer ? (
              assignment.status === 'closed' ? (
                <div className="form-group">
                  <p><strong>Score (0–30):</strong> {assignment.score || 'Not evaluated yet'}</p>
                  <p className="text-muted"><em>This assignment is closed and cannot be re-evaluated.</em></p>
                </div>
              ) : (
                <form onSubmit={handleEvaluate}>
                  <div className="form-group">
                    <label>Score (0–30):</label>
                    <input
                      type="number"
                      min="0"
                      max="30"
                      value={score}
                      onChange={(e) => setScore(e.target.value)}
                      placeholder="Enter score from 0 to 30"
                      required
                    />
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="primary-button">
                      Evaluate
                    </button>
                  </div>
                </form>
              )
            ) : (
              <div className="form-group">
                <p className="text-muted"><em>Evaluation will be available after students submit an answer.</em></p>
              </div>
            )}
          </div>
        )}

        {assignment.score && assignment.status === 'open' && (
          <div className="success mt-lg">
            <strong>Current Score:</strong> {assignment.score}
          </div>
        )}
      </div>
    </div>
  );
}
