import express from 'express';
import {
  getAssignmentsByTeacher,
  getAssignmentsForStudent,
  getAssignmentById,
  createAssignment,
  updateAnswer,
  evaluateAssignment
} from '../dao/assignmentsDao.js';

import {
  addGroupMembers,
  getGroupMembers
} from '../dao/groupMembersDao.js';

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
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
});

/**
 * Get details of a specific assignment.
 */
router.get('/assignments/:id', isLoggedIn, async (req, res) => {
  try {
    const assignment = await getAssignmentById(req.params.id);
    if (!assignment) return res.status(404).json({ error: 'Assignment not found' });

    // Basic role-based access
    if (
      (req.user.role === 'teacher' && assignment.teacherId !== req.user.id) ||
      (req.user.role === 'student' &&
        !(await getGroupMembers(assignment.id)).some(m => m.studentId === req.user.id))
    ) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    res.json(assignment);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch assignment' });
  }
});

/**
 * Create a new assignment (teacher only).
 */
router.post('/assignments', isLoggedIn, isTeacher, async (req, res) => {
  const { question } = req.body;
  if (!question) return res.status(400).json({ error: 'Missing question text' });

  try {
    const id = await createAssignment({ teacherId: req.user.id, question });
    res.status(201).json({ id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create assignment' });
  }
});

/**
 * Assign students to a group (teacher only).
 */
router.post('/assignments/:id/group', isLoggedIn, isTeacher, async (req, res) => {
  const { studentIds } = req.body;
  if (!Array.isArray(studentIds) || studentIds.length === 0)
    return res.status(400).json({ error: 'Missing or invalid student list' });

  try {
    const assignment = await getAssignmentById(req.params.id);
    if (!assignment) return res.status(404).json({ error: 'Assignment not found' });

    if (assignment.teacherId !== req.user.id)
      return res.status(403).json({ error: 'Forbidden: not your assignment' });

    if (assignment.status !== 'open')
      return res.status(400).json({ error: 'Assignment is closed' });

    await addGroupMembers(assignment.id, studentIds);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: 'Failed to assign group' });
  }
});

/**
 * Submit or update the answer (student only).
 */
router.put('/assignments/:id/answer', isLoggedIn, isStudent, async (req, res) => {
  const { answer } = req.body;
  if (!answer) return res.status(400).json({ error: 'Missing answer' });

  try {
    const assignment = await getAssignmentById(req.params.id);
    if (!assignment) return res.status(404).json({ error: 'Assignment not found' });

    const members = await getGroupMembers(assignment.id);
    const isInGroup = members.some(m => m.studentId === req.user.id);

    if (!isInGroup)
      return res.status(403).json({ error: 'You are not in this assignment group' });

    if (assignment.status !== 'open')
      return res.status(400).json({ error: 'Assignment is closed' });

    await updateAnswer(assignment.id, answer);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit answer' });
  }
});

/**
 * Evaluate and close an assignment (teacher only).
 */
router.put('/assignments/:id/evaluate', isLoggedIn, isTeacher, async (req, res) => {
  const { score } = req.body;
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

    await evaluateAssignment(assignment.id, numericScore);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: 'Failed to evaluate assignment' });
  }
});

export default router;
