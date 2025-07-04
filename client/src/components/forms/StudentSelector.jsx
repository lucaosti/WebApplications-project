/**
 * Student selector component for creating assignments.
 * Displays a list of students with checkboxes for selection.
 * Handles disabling of ineligible students based on collaboration limits.
 * 
 * @param {Array} students - Array of all student objects
 * @param {Array} selectedIds - Array of currently selected student IDs
 * @param {Array} ineligibleIds - Array of student IDs that cannot be selected
 * @param {Function} onSelectionChange - Callback when selection changes
 */
export default function StudentSelector({ 
  students, 
  selectedIds, 
  ineligibleIds, 
  onSelectionChange 
}) {
  /**
   * Handle checkbox state changes for student selection.
   * Adds or removes student from selection based on current state.
   * 
   * @param {number} studentId - The ID of the student whose checkbox was clicked
   */
  const handleCheckboxChange = (studentId) => {
    if (selectedIds.includes(studentId)) {
      // Remove student from selection
      onSelectionChange(selectedIds.filter(id => id !== studentId));
    } else {
      // Add student to selection
      onSelectionChange([...selectedIds, studentId]);
    }
  };

  return (
    <div className="form-group">
      <label>Select Students for Group Assignment:</label>
      <div className="student-list">
        {students.map((student) => {
          const isSelected = selectedIds.includes(student.id);
          const isIneligible = ineligibleIds.includes(student.id);
          
          return (
            <div 
              key={student.id} 
              className={`student-item ${isIneligible ? 'ineligible' : ''}`}
            >
              <label>
                <input
                  type="checkbox"
                  checked={isSelected}
                  disabled={isIneligible && !isSelected} // Allow deselection of ineligible students
                  onChange={() => handleCheckboxChange(student.id)}
                />
                <span className={isIneligible ? 'text-muted' : ''}>
                  {student.name}
                </span>
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
}
