import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth';
import { useEffect, useState } from 'react';
import { apiFetch } from '../api/client.js';

/**
 * AssignmentView shows full details of an assignment.
 * Students can submit and edit the group answer. Teachers can evaluate.
 */
export default function AssignmentView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [assignment, setAssignment] = useState(null);
  const [answer, setAnswer] = useState('');
  const [score, setScore] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isForbidden, setIsForbidden] = useState(false);

  // Load assignment details on mount
  useEffect(() => {
    /**
     * Load assignment details from the server.
     * Sets assignment data, answer, and score in state.
     */
    async function loadAssignment() {
      try {
        const data = await apiFetch(`/api/assignments/${id}`);
        setAssignment(data);
        setAnswer(data.answer || '');
        setScore(data.score || '');
        setIsForbidden(false);
      } catch (err) {
        if (err.status === 403) {
          setIsForbidden(true);
          setError('Forbidden: You do not have access to this assignment.');
        } else {
          setError(err.message || 'Failed to load assignment');
        }
      }
    }

    loadAssignment();
  }, [id]);

  // Handle success message from navigation state
  useEffect(() => {
    if (location.state?.successMessage) {
      // Set success message as persistent object for assignment creation
      setSuccess({
        message: location.state.successMessage,
        persistent: true
      });
      // Clear the state to prevent the message from showing again on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  /**
   * Handle answer submission by students.
   * Updates the assignment with the provided answer.
   * Handles conflict cases when assignment is closed during submission.
   * @param {Event} e - Form submission event
   */
  async function handleSubmitAnswer(e) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const updated = await apiFetch(`/api/assignments/${id}/answer`, {
        method: 'PUT',
        body: { answer },
      });
      setAssignment(updated);
      // Make student success message persistent like teacher evaluation
      setSuccess({
        message: 'Your answer has been saved successfully!',
        persistent: true
      });
    } catch (err) {
      if (err.status === 409) {
        // Assignment was closed before submission
        if (err.data && err.data.assignment) {
          setAssignment(err.data.assignment);
          setAnswer(err.data.assignment.answer || '');
          setError('Assignment was closed before your submission.');
        } else {
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
    setSuccess(null);

    try {
      const updated = await apiFetch(`/api/assignments/${id}/evaluate`, {
        method: 'PUT',
        body: { score, expectedAnswer: assignment.answer || '' },
      });
      setAssignment(updated);
      // For evaluation, we don't want auto-dismiss, so we set a flag
      const successMessage = {
        message: `Assignment evaluated successfully!`,
        persistent: true
      };
      setSuccess(successMessage);
    } catch (err) {
      if (err.status === 409) {
        // Answer was updated by students
        if (err.data && err.data.assignment) {
          setAssignment(err.data.assignment);
          setAnswer(err.data.assignment.answer || '');
          setError('Answer was updated by students. Please review again.');
        } else {
          setError('Answer was updated by students. Please review again.');
        }
      } else {
        setError(err.message || 'Failed to evaluate assignment');
      }
    }
  }

  if (!assignment && !isForbidden) {
    return (
      <div>
        {error && <p className="error">{error}</p>}
        <p>Loading assignment...</p>
      </div>
    );
  }

  // Handle forbidden access case
  if (isForbidden) {
    return (
      <div className="assignment-view">
        <button 
          onClick={() => {
            setSuccess(null); // Clear success message when navigating back
            navigate(user?.role === 'teacher' ? '/teacher' : '/student');
          }} 
          className="secondary-button mb-lg"
        >
          ← Back
        </button>

        <div className="error error-block mb-md">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="assignment-view">
      <button 
        onClick={() => {
          setSuccess(null); // Clear success message when navigating back
          navigate(user?.role === 'teacher' ? '/teacher' : '/student');
        }} 
        className="secondary-button mb-lg"
      >
        ← Back
      </button>

      {error && (
        <div className="error error-block mb-md">
          {error}
        </div>
      )}

      {/* Success message - unified persistent style for all cases */}
      {success && (
        <div className="success-banner">
          <span>{typeof success === 'string' ? success : success.message}</span>
          <button 
            onClick={() => setSuccess(null)} 
            className="success-banner-dismiss"
            aria-label="Dismiss success message"
          >
            ×
          </button>
        </div>
      )}

      <div className="form-container">
        <h2>Assignment</h2>
        
        <div className="mb-md">
          <p><strong>Question:</strong> {assignment.question}</p>
          <p><strong>Teacher:</strong> {assignment.teacherName || 'Unknown'}</p>
          <p><strong>Group Members:</strong> {assignment.groupMembers?.map(m => m.studentName).join(', ')}</p>
        </div>

        {user.role === 'student' && (
          <div className="form-group">
            <label>Group Answer:</label>
            {assignment.status === 'closed' ? (
              <div>
                <div className="form-container readonly-content p-md">
                  {answer || 'No answer submitted.'}
                </div>
                {assignment.score !== null && assignment.score !== undefined && (
                  <div className="mt-md">
                    <p><strong>Score:</strong> {assignment.score}/30</p>
                  </div>
                )}
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
              <div className="form-container readonly-content p-md">
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
