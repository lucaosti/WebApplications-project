/**
 * Student selector component for creating assignments
 */
export default function StudentSelector({ 
  students, 
  selectedIds, 
  ineligibleIds, 
  onSelectionChange 
}) {
  const handleCheckboxChange = (studentId) => {
    if (selectedIds.includes(studentId)) {
      // Remove from selection
      onSelectionChange(selectedIds.filter(id => id !== studentId));
    } else {
      // Add to selection
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
                  disabled={isIneligible && !isSelected}
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
