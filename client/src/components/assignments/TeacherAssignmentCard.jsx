import { useNavigate } from 'react-router-dom';

/**
 * Teacher-specific assignment card component.
 * Displays assignment information from the teacher's perspective
 * with appropriate action buttons for evaluation and viewing.
 * 
 * @param {Object} assignment - The assignment object to display
 */
export default function TeacherAssignmentCard({ assignment }) {
  const navigate = useNavigate();

  /**
   * Get appropriate button text based on assignment status and answer state.
   * 
   * @returns {string} The text to display on the action button
   */
  const getButtonText = () => {
    if (assignment.status === 'closed') {
      return 'View Details';
    }
    return assignment.answer && assignment.answer.trim() !== '' ? 'Evaluate' : 'View';
  };

  /**
   * Generate status text including answer and score information.
   * 
   * @returns {string} Formatted status text for display
   */
  const getStatusText = () => {
    let statusText = assignment.status;
    
    if (assignment.status === 'open') {
      statusText += assignment.answer && assignment.answer.trim() !== '' ? ' • Answer submitted' : '';
    } else if (assignment.status === 'closed' && assignment.score) {
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
          <p><strong>Group Members:</strong></p>
          <p>{assignment.groupMembers?.map(m => m.name).join(', ') || 'No members'}</p>
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
