import AssignmentCard from './AssignmentCard.jsx';

/**
 * Assignment list component for displaying a list of assignments
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
