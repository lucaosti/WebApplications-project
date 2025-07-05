import { TeacherAssignmentCard } from '../index.js';

/**
 * Teacher-specific assignment list component.
 * Displays assignments using TeacherAssignmentCard components
 * with teacher-appropriate interface and actions.
 * 
 * @param {Array} assignments - Array of assignment objects to display
 * @param {string} title - Section title to display
 * @param {string} emptyMessage - Message to show when no assignments exist
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
