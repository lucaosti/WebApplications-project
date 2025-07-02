import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext.jsx';

/**
 * Assignment card component for displaying individual assignments
 */
export default function AssignmentCard({ assignment, showScore = false }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const getButtonText = () => {
    if (assignment.status === 'closed') {
      return 'View Results';
    }
    return assignment.answer ? 'View/Edit' : 'Submit Answer';
  };

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
