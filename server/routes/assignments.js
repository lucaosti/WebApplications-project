import express from 'express';
import {
  getAssignmentsByTeacher,
  getAssignmentsForStudent,
  getAssignmentById,
  createAssignment,
  updateAnswer,
  evaluateAssignment,
  getStudentAverageScore,
  getClassStatusForTeacher
} from '../dao/assignmentsDao.js';

import {
  addGroupMembers,
  getGroupMembers,
  countGroupParticipations
} from '../dao/groupMembersDao.js';

import {
  getAllStudents
} from '../dao/usersDao.js';

import {
  isLoggedIn,
  isTeacher,
  isStudent
} from '../middlewares/auth.js';

const router = express.Router();

/**
 * Get assignments for the current user.
 * Students get theirs; teachers get the ones they created.
 */
router.get('/assignments', isLoggedIn, async (req, res) => {
  try {
    if (req.user.role === 'student') {
      const assignments = await getAssignmentsForStudent(req.user.id);
      res.json(assignments);
    } else if (req.user.role === 'teacher') {
      const assignments = await getAssignmentsByTeacher(req.user.id);
      res.json(assignments);
    } else {
      res.status(403).json({ error: 'Invalid role' });
    }
  } catch (err) {
    console.error('Error fetching assignments:', err);
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
});

/**
 * Get details of a specific assignment.
 */
router.get('/assignments/:id', isLoggedIn, async (req, res) => {
  try {
    const assignment = await getAssignmentById(req.params.id);
    
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    // Basic role-based access
    const group = await getGroupMembers(assignment.id);
    const isStudentInGroup = group.some(m => m.studentId === req.user.id);

    if (
      (req.user.role === 'teacher' && assignment.teacherId !== req.user.id) ||
      (req.user.role === 'student' && !isStudentInGroup)
    ) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Add groupMembers info: array of { studentId, studentName }
    const groupWithNames = group.map(m => ({
      studentId: m.studentId,
      studentName: m.studentName
    }));

    const result = {
      ...assignment,
      groupMembers: groupWithNames
    };
    
    res.json(result);
  } catch (err) {
    console.error('Error fetching single assignment:', err);
    res.status(500).json({ error: 'Failed to fetch assignment' });
  }
});

/**
 * Create a new assignment (teacher only).
 */
router.post('/assignments', isLoggedIn, isTeacher, async (req, res) => {
  const { question } = req.body;
  if (typeof question !== 'string' || question.trim().length === 0) {
    return res.status(400).json({ error: 'Question cannot be empty' });
  }

  try {
    const id = await createAssignment({ teacherId: req.user.id, question });
    res.status(201).json({ id });
  } catch (err) {
    console.error('Error creating assignment:', err);
    res.status(500).json({ error: 'Failed to create assignment' });
  }
});

/**
 * Assign students to a group (teacher only).
 */
router.post('/assignments/:id/group', isLoggedIn, isTeacher, async (req, res) => {
  const { studentIds } = req.body;

  if (!Array.isArray(studentIds) || studentIds.length < 2 || studentIds.length > 6)
    return res.status(400).json({ error: 'Group must have between 2 and 6 students' });

  try {
    const assignment = await getAssignmentById(req.params.id);
    if (!assignment) return res.status(404).json({ error: 'Assignment not found' });

    if (assignment.teacherId !== req.user.id)
      return res.status(403).json({ error: 'Forbidden: not your assignment' });

    if (assignment.status !== 'open')
      return res.status(400).json({ error: 'Assignment is closed' });

    // Check for invalid repeated pairs
    for (let i = 0; i < studentIds.length; i++) {
      for (let j = i + 1; j < studentIds.length; j++) {
        const { count } = await countGroupParticipations(
          req.user.id,
          studentIds[i],
          studentIds[j]
        );
        if (count >= 2) {
          return res.status(400).json({
            error: `Pair (${studentIds[i]}, ${studentIds[j]}) has already worked together 2 times`
          });
        }
      }
    }

    await addGroupMembers(assignment.id, studentIds);
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to assign group' });
  }
});

/**
 * Submit or update the answer (student only).
 */
router.put('/assignments/:id/answer', isLoggedIn, isStudent, async (req, res) => {
  const { answer } = req.body;
  if (typeof answer !== 'string' || answer.trim().length === 0) {
    return res.status(400).json({ error: 'Answer cannot be empty' });
  }

  try {
    const assignment = await getAssignmentById(req.params.id);
    if (!assignment) return res.status(404).json({ error: 'Assignment not found' });

    const members = await getGroupMembers(assignment.id);
    const isInGroup = members.some(m => m.studentId === req.user.id);

    if (!isInGroup)
      return res.status(403).json({ error: 'You are not in this assignment group' });

    if (assignment.status !== 'open') {
      return res.status(409).json({
        error: 'Assignment already closed',
        assignment: assignment
      });
    }

    await updateAnswer(assignment.id, answer);
    const updated = await getAssignmentById(assignment.id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit answer' });
  }
});

/**
 * Evaluate and close an assignment (teacher only).
 */
router.put('/assignments/:id/evaluate', isLoggedIn, isTeacher, async (req, res) => {
  const { score, expectedAnswer } = req.body;
  const numericScore = Number(score);

  if (!Number.isInteger(numericScore) || numericScore < 0 || numericScore > 30)
    return res.status(400).json({ error: 'Score must be an integer between 0 and 30' });

  try {
    const assignment = await getAssignmentById(req.params.id);
    if (!assignment) return res.status(404).json({ error: 'Assignment not found' });

    if (assignment.teacherId !== req.user.id)
      return res.status(403).json({ error: 'Forbidden: not your assignment' });

    if (assignment.status !== 'open')
      return res.status(400).json({ error: 'Assignment already closed' });

    if (expectedAnswer !== assignment.answer) {
      return res.status(409).json({
        error: 'Answer has been updated by the students',
        assignment: assignment
      });
    }

    await evaluateAssignment(assignment.id, numericScore);
    const updated = await getAssignmentById(assignment.id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to evaluate assignment' });
  }
});

/**
 * Get average score for a student (used in student dashboard).
 */
router.get('/student/average', isLoggedIn, isStudent, async (req, res) => {
  try {
    const avg = await getStudentAverageScore(req.user.id);
    res.json({ average: avg });
  } catch (err) {
    console.error('Error calculating student average:', err);
    res.status(500).json({ error: 'Failed to calculate average' });
  }
});

/**
 * Get class status for teacher: students, open/closed counts and averages.
 */
router.get('/teacher/class-status', isLoggedIn, isTeacher, async (req, res) => {
  try {
    const stats = await getClassStatusForTeacher(req.user.id);
    res.json(stats);
  } catch (err) {
    console.error('Error fetching class status:', err);
    res.status(500).json({ error: 'Failed to fetch class status' });
  }
});

/**
 * Get eligible students to be added to a group,
 * excluding those who already collaborated with any of the selected students twice (with the same teacher).
 * Used to dynamically update selection client-side.
 */
router.post('/students/eligible', isLoggedIn, isTeacher, async (req, res) => {
  const { selectedIds } = req.body;

  if (!Array.isArray(selectedIds)) {
    return res.status(400).json({ error: 'selectedIds must be an array' });
  }

  try {
    const allStudents = await getAllStudents();
    const eligible = [];

    for (const student of allStudents) {
      if (selectedIds.includes(student.id)) continue;

      let valid = true;
      for (const sid of selectedIds) {
        const { count } = await countGroupParticipations(req.user.id, student.id, sid);
        if (count >= 2) {
          valid = false;
          break;
        }
      }
      if (valid) eligible.push(student);
    }

    res.json(eligible);
  } catch (err) {
    console.error('Error determining eligible students:', err);
    res.status(500).json({ error: 'Failed to determine eligible students' });
  }
});

/**
 * Get all students (teacher only) - used for creating assignments.
 */
router.get('/students', isLoggedIn, isTeacher, async (req, res) => {
  try {
    const students = await getAllStudents();
    res.json(students);
  } catch (err) {
    console.error('Error fetching students:', err);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

/**
 * Test endpoint to check authentication status
 */
router.get('/test-auth', (req, res) => {
  if (req.user) {
    res.json({
      authenticated: true,
      user: req.user,
      sessionId: req.sessionID
    });
  } else {
    res.json({
      authenticated: false,
      sessionId: req.sessionID
    });
  }
});

export default router;
