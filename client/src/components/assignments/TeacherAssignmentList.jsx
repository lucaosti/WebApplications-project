import TeacherAssignmentCard from './TeacherAssignmentCard.jsx';

/**
 * Teacher-specific assignment list component
 */
export default function TeacherAssignmentList({ 
  assignments, 
  title, 
  emptyMessage = "No assignments found." 
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
              <TeacherAssignmentCard 
                key={assignment.id} 
                assignment={assignment} 
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
