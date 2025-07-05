import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth';

/**
 * Assignment card component for displaying individual assignments.
 * Shows assignment details, status, and provides action button.
 * Adapts display based on assignment status and user permissions.
 * 
 * @param {Object} assignment - The assignment object to display
 * @param {boolean} showScore - Whether to show the score in the status
 */
export default function AssignmentCard({ assignment, showScore = false }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  /**
   * Get appropriate button text based on assignment status and answer state.
   * 
   * @returns {string} The text to display on the action button
   */
  const getButtonText = () => {
    if (assignment.status === 'closed') {
      return 'View Results';
    }
    return assignment.answer ? 'View/Edit' : 'Submit Answer';
  };

  /**
   * Generate status text including answer and score information.
   * 
   * @returns {string} Formatted status text for display
   */
  const getStatusText = () => {
    let statusText = assignment.status;
    
    if (assignment.status === 'open') {
      statusText += assignment.answer ? ' • Answer submitted' : ' • No answer submitted';
    } else if (assignment.status === 'closed' && showScore && assignment.score) {
      statusText += ` • Score: ${assignment.score}/30`;
    }
    
    return statusText;
  };

  return (
    <li className="assignment-card">
      <div className="assignment-content">
        <div className="assignment-main">
          <h4>{assignment.question}</h4>
          <p><strong>Status:</strong> {getStatusText()}</p>
        </div>
        <div className="group-members">
          <p><strong>Teacher:</strong> {assignment.teacherName || 'Unknown'}</p>
          <p><strong>Teammates:</strong> {
            assignment.groupMembers?.filter(m => m.name !== user?.name).map(m => m.name).join(', ') || 'No teammates'
          }</p>
        </div>
      </div>
      <button 
        onClick={() => navigate(`/assignment/${assignment.id}`)} 
        className="secondary-button assignment-button"
      >
        {getButtonText()}
      </button>
    </li>
  );
}
