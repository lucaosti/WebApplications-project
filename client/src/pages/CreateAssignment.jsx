import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.jsx';

/**
 * CreateAssignment allows a teacher to select a valid group of students
 * and assign them a new question. Automatically filters invalid combinations.
 */
export default function CreateAssignment() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [allStudents, setAllStudents] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [question, setQuestion] = useState('');
  const [error, setError] = useState(null);
  const [ineligibleIds, setIneligibleIds] = useState([]);

  // Load full student list once
  useEffect(() => {
    console.log('Loading students...');
    apiFetch('/api/students')
      .then((data) => {
        console.log('Received students data:', data);
        const mappedStudents = data.map(s => ({ id: s.id, name: s.name }));
        console.log('Mapped students:', mappedStudents);
        setAllStudents(mappedStudents);
      })
      .catch((err) => {
        console.error('Error loading students:', err);
        setError('Failed to load students');
      });
  }, []);

  /**
   * Update ineligible students based on current selection.
   * Fetches eligible students from the server and calculates which ones are ineligible.
   */
  useEffect(() => {
    console.log('Updating ineligible students. allStudents:', allStudents.length, 'selectedIds:', selectedIds);
    
    // If we haven't loaded students yet, do nothing
    if (allStudents.length === 0) {
      console.log('No students loaded yet, skipping ineligible update');
      return;
    }
    
    if (selectedIds.length === 0) {
      console.log('No selection, no ineligible students');
      setIneligibleIds([]);
      return;
    }

    console.log('Fetching eligible students to determine ineligible ones:', selectedIds);
    apiFetch('/api/students/eligible', {
      method: 'POST',
      body: { selectedIds },
    })
      .then((eligibleStudents) => {
        console.log('Received eligible students:', eligibleStudents);
        // Ineligible students are those not in the eligible list and not already selected
        const eligibleIds = eligibleStudents.map(s => s.id);
        const ineligible = allStudents
          .filter(s => !eligibleIds.includes(s.id) && !selectedIds.includes(s.id))
          .map(s => s.id);
        console.log('Calculated ineligible IDs:', ineligible);
        setIneligibleIds(ineligible);
      })
      .catch((err) => {
        console.error('Error fetching eligibility:', err);
        setError('Failed to fetch eligibility');
      });
  }, [selectedIds, allStudents]);

  /**
   * Toggle student selection - add if not selected, remove if selected.
   * Respects group size limits and eligibility constraints.
   * @param {number} id - The student ID to toggle
   */
  function toggleStudent(id) {
    if (selectedIds.includes(id)) {
      // If already selected, remove it
      setSelectedIds(selectedIds.filter(sid => sid !== id));
    } else if (selectedIds.length < 6 && !ineligibleIds.includes(id)) {
      // If not selected, under limit and not ineligible, add it
      setSelectedIds([...selectedIds, id]);
    }
  }

  /**
   * Cancel assignment creation and return to teacher dashboard.
   */
  function handleCancel() {
    navigate('/teacher');
  }

  /**
   * Handle form submission to create assignment and assign group.
   * First creates the assignment, then assigns the selected students to it.
   * @param {Event} e - Form submission event
   */
  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (selectedIds.length < 2 || selectedIds.length > 6) {
      setError('Group must have between 2 and 6 students');
      return;
    }

    try {
      // Step 1: Create the assignment
      const assignmentData = await apiFetch('/api/assignments', {
        method: 'POST',
        body: { question },
      });

      const { id } = assignmentData;

      // Step 2: Add group members
      await apiFetch(`/api/assignments/${id}/group`, {
        method: 'POST',
        body: { studentIds: selectedIds },
      });

      navigate(`/assignment/${id}`);
    } catch (err) {
      setError(err.message || 'Failed to create assignment');
    }
  }

  console.log('Render - allStudents:', allStudents.length, 'selectedIds:', selectedIds.length, 'ineligibleIds:', ineligibleIds.length, 'error:', error);

  return (
    <div className="create-assignment">
      <h2>Create New Assignment</h2>

      {error && <p className="error">{error}</p>}

      <div className="form-container">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Assignment Question:</label>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              required
              placeholder="Enter your assignment question here..."
            />
          </div>

          <div className="form-group">
            <label>
              Select Students (2-6):
              <span className="selection-count"> {selectedIds.length} selected</span>
            </label>
            <div className="list-container">
              <ul className="student-list">
                {allStudents.map((student) => {
                  const isSelected = selectedIds.includes(student.id);
                  const isIneligible = ineligibleIds.includes(student.id);
                  const isDisabled = !isSelected && (selectedIds.length >= 6 || isIneligible);
                  
                  return (
                    <li key={student.id} className={`student-item ${isSelected ? 'selected' : ''} ${isIneligible ? 'ineligible' : ''}`}>
                      <label>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleStudent(student.id)}
                          disabled={isDisabled}
                        />
                        <span className={isIneligible ? 'ineligible-text' : ''}>{student.name}</span>
                        {isIneligible && !isSelected && <span className="reason"> (already collaborated twice)</span>}
                      </label>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={handleCancel} className="cancel-button">
              Cancel
            </button>
            <button type="submit" className="create-button" disabled={selectedIds.length < 2 || selectedIds.length > 6}>
              Create Assignment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
