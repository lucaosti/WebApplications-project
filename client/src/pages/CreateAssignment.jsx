import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.jsx';
import ErrorMessage from '../components/common/ErrorMessage.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import StudentSelector from '../components/forms/StudentSelector.jsx';

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
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Load full student list once
  useEffect(() => {
    const loadStudents = async () => {
      try {
        console.log('Loading students...');
        const data = await apiFetch('/api/students');
        console.log('Received students data:', data);
        const mappedStudents = data.map(s => ({ id: s.id, name: s.name }));
        console.log('Mapped students:', mappedStudents);
        setAllStudents(mappedStudents);
      } catch (err) {
        console.error('Error loading students:', err);
        setError('Failed to load students');
      } finally {
        setLoading(false);
      }
    };
    
    loadStudents();
  }, []);

  /**
   * Update ineligible students based on current selection.
   */
  useEffect(() => {
    console.log('Updating ineligible students. allStudents:', allStudents.length, 'selectedIds:', selectedIds);
    
    if (allStudents.length === 0 || selectedIds.length === 0) {
      setIneligibleIds([]);
      return;
    }

    const updateIneligibility = async () => {
      try {
        console.log('Fetching eligible students:', selectedIds);
        const eligibleStudents = await apiFetch('/api/students/eligible', {
          method: 'POST',
          body: { selectedIds },
        });
        
        const eligibleIds = eligibleStudents.map(s => s.id);
        const ineligible = allStudents
          .filter(s => !eligibleIds.includes(s.id) && !selectedIds.includes(s.id))
          .map(s => s.id);
        console.log('Calculated ineligible IDs:', ineligible);
        setIneligibleIds(ineligible);
      } catch (err) {
        console.error('Error fetching eligibility:', err);
        setError('Failed to fetch eligibility');
      }
    };

    updateIneligibility();
  }, [selectedIds, allStudents]);

  /**
   * Handle changes to student selection.
   * Enforces maximum group size limit of 6 students.
   */
  const handleSelectionChange = (newSelectedIds) => {
    if (newSelectedIds.length <= 6) {
      setSelectedIds(newSelectedIds);
    }
  };

  /**
   * Cancel assignment creation and return to teacher dashboard.
   */
  const handleCancel = () => {
    navigate('/teacher');
  };

  /**
   * Handle form submission for creating a new assignment.
   * Validates input, creates assignment, assigns group, and redirects on success.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!question.trim()) {
      setError('Please enter a question');
      return;
    }
    
    if (selectedIds.length < 2 || selectedIds.length > 6) {
      setError('Group must have between 2 and 6 students');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Create the assignment
      const assignmentData = await apiFetch('/api/assignments', {
        method: 'POST',
        body: { question: question.trim() },
      });

      // Add group members
      await apiFetch(`/api/assignments/${assignmentData.id}/group`, {
        method: 'POST',
        body: { studentIds: selectedIds },
      });

      navigate(`/assignment/${assignmentData.id}`);
    } catch (err) {
      setError(err.message || 'Failed to create assignment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading students..." />;
  }

  return (
    <div className="create-assignment">
      <h2>Create New Assignment</h2>

      <ErrorMessage error={error} />

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
              disabled={submitting}
            />
          </div>

          <StudentSelector 
            students={allStudents}
            selectedIds={selectedIds}
            ineligibleIds={ineligibleIds}
            onSelectionChange={handleSelectionChange}
          />

          <div className="form-group">
            <p>Selected: {selectedIds.length}/6 students (minimum 2 required)</p>
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              onClick={handleCancel} 
              className="cancel-button"
              disabled={submitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="create-button" 
              disabled={submitting || selectedIds.length < 2 || selectedIds.length > 6 || !question.trim()}
            >
              {submitting ? 'Creating...' : 'Create Assignment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
