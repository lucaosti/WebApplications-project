import { AssignmentCard } from '../index.js';

/**
 * Assignment list component for displaying a list of assignments.
 * Renders a titled section with assignment cards and handles empty states.
 * 
 * @param {Array} assignments - Array of assignment objects to display
 * @param {string} title - Section title to display
 * @param {string} emptyMessage - Message to show when no assignments exist
 * @param {boolean} showScore - Whether to show scores in assignment cards
 */
export default function AssignmentList({ 
  assignments, 
  title, 
  emptyMessage = "No assignments found.", 
  showScore = false 
}) {
  const count = assignments.length;

  return (
    <div className="assignment-section">
      <h3>{title} ({count})</h3>
      <div className="list-container">
        {count === 0 ? (
          <p>{emptyMessage}</p>
        ) : (
          <ul className="assignment-list">
            {assignments.map((assignment) => (
              <AssignmentCard 
                key={assignment.id} 
                assignment={assignment} 
                showScore={showScore}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
