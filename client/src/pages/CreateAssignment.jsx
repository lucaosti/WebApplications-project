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
  const [eligible, setEligible] = useState([]);

  // Load full student list once
  useEffect(() => {
    apiFetch('/api/teacher/class-status')
      .then((res) => res.ok ? res.json() : Promise.reject(res))
      .then((data) => setAllStudents(data.map(s => ({ id: s.studentId, name: s.studentName }))))
      .catch(() => setError('Failed to load students'));
  }, []);

  // Update eligible students based on current selection
  useEffect(() => {
    if (selectedIds.length === 0) {
      setEligible(allStudents);
      return;
    }

    apiFetch('/api/students/eligible', {
      method: 'POST',
      body: { selectedIds },
    })
      .then((res) => res.ok ? res.json() : Promise.reject(res))
      .then(setEligible)
      .catch(() => setError('Failed to fetch eligibility'));
  }, [selectedIds]);

  function toggleStudent(id) {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(sid => sid !== id));
    } else if (selectedIds.length < 6) {
      setSelectedIds([...selectedIds, id]);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (selectedIds.length < 2 || selectedIds.length > 6) {
      setError('Group must have between 2 and 6 students');
      return;
    }

    try {
      // Step 1: Create the assignment
      const res = await apiFetch('/api/assignments', {
        method: 'POST',
        body: { question },
      });

      if (!res.ok) throw await res.json();

      const { id } = await res.json();

      // Step 2: Add group members
      const groupRes = await apiFetch(`/api/assignments/${id}/group`, {
        method: 'POST',
        body: { studentIds: selectedIds },
      });

      if (!groupRes.ok) throw await groupRes.json();

      navigate(`/assignment/${id}`);
    } catch (err) {
      setError(err.error || 'Failed to create assignment');
    }
  }

  return (
    <div className="create-assignment">
      <h2>Create New Assignment</h2>

      {error && <p className="error">{error}</p>}

      <form onSubmit={handleSubmit}>
        <label>Assignment Question:</label>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          required
        />

        <label>Select Students (2-6):</label>
        <ul className="student-list">
          {eligible.map((student) => (
            <li key={student.id}>
              <label>
                <input
                  type="checkbox"
                  checked={selectedIds.includes(student.id)}
                  onChange={() => toggleStudent(student.id)}
                  disabled={
                    !selectedIds.includes(student.id) && selectedIds.length >= 6
                  }
                />
                {student.name}
              </label>
            </li>
          ))}
        </ul>

        <button type="submit">Create Assignment</button>
      </form>
    </div>
  );
}
