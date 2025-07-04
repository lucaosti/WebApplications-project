import express from 'express';
import {
  getAssignmentsByTeacher,
  getAssignmentsForStudent,
  getAssignmentByIdWithMembers,
  createAssignment,
  updateAnswer,
  evaluateAssignment,
  getStudentAverageScore,
  getClassStatusForTeacher
} from '../dao/assignmentsDao.mjs';

import {
  addGroupMembers,
  countGroupParticipations
} from '../dao/groupMembersDao.mjs';

import {
  getAllStudents
} from '../dao/usersDao.mjs';

import {
  isLoggedIn,
  isTeacher,
  isStudent
} from '../middlewares/auth.mjs';

const router = express.Router();

/**
 * GET /api/assignments
 * Get assignments for the current user.
 * Students receive their assigned tasks, teachers receive assignments they created.
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
 * GET /api/assignments/:id
 * Get details of a specific assignment.
 * Access control: teachers can only access their own assignments,
 * students can only access assignments they are assigned to.
 */
router.get('/assignments/:id', isLoggedIn, async (req, res) => {
  try {
    const assignment = await getAssignmentByIdWithMembers(req.params.id);
    
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    // Role-based access control
    const isStudentInGroup = assignment.groupMembers.some(m => m.studentId === req.user.id);

    if (
      (req.user.role === 'teacher' && assignment.teacherId !== req.user.id) ||
      (req.user.role === 'student' && !isStudentInGroup)
    ) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    res.json(assignment);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch assignment' });
  }
});

/**
 * POST /api/assignments
 * Create a new assignment (teacher only).
 * Validates question content and creates assignment in database.
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
    res.status(500).json({ error: 'Failed to create assignment' });
  }
});

/**
 * POST /api/assignments/:id/group
 * Assign students to a group (teacher only).
 * Validates group size and assigns students to the specified assignment.
 */
router.post('/assignments/:id/group', isLoggedIn, isTeacher, async (req, res) => {
  const { studentIds } = req.body;

  if (!Array.isArray(studentIds) || studentIds.length < 2 || studentIds.length > 6) {
    return res.status(400).json({ error: 'Group must have between 2 and 6 students' });
  }

  try {
    const assignment = await getAssignmentByIdWithMembers(req.params.id);
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    if (assignment.teacherId !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden: not your assignment' });
    }

    if (assignment.status !== 'open') {
      return res.status(400).json({ error: 'Assignment is closed' });
    }

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
    res.status(500).json({ error: 'Failed to assign group' });
  }
});

/**
 * PUT /api/assignments/:id/answer
 * Submit or update the answer (student only).
 * Allows students to submit or modify their group's answer for an assignment.
 */
router.put('/assignments/:id/answer', isLoggedIn, isStudent, async (req, res) => {
  const { answer } = req.body;
  
  if (typeof answer !== 'string' || answer.trim().length === 0) {
    return res.status(400).json({ error: 'Answer cannot be empty' });
  }

  try {
    const assignment = await getAssignmentByIdWithMembers(req.params.id);
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    const isInGroup = assignment.groupMembers.some(m => m.studentId === req.user.id);

    if (!isInGroup) {
      return res.status(403).json({ error: 'You are not in this assignment group' });
    }

    if (assignment.status !== 'open') {
      const fullAssignment = await getAssignmentByIdWithMembers(assignment.id);
      return res.status(409).json({
        error: 'Assignment already closed',
        assignment: fullAssignment
      });
    }

    await updateAnswer(assignment.id, answer);
    const updated = await getAssignmentByIdWithMembers(assignment.id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit answer' });
  }
});

/**
 * PUT /api/assignments/:id/evaluate
 * Evaluate and close an assignment (teacher only).
 * Assigns a score and closes the assignment, preventing further modifications.
 */
router.put('/assignments/:id/evaluate', isLoggedIn, isTeacher, async (req, res) => {
  const { score, expectedAnswer } = req.body;
  const numericScore = Number(score);

  if (!Number.isInteger(numericScore) || numericScore < 0 || numericScore > 30) {
    return res.status(400).json({ error: 'Score must be an integer between 0 and 30' });
  }

  try {
    const assignment = await getAssignmentByIdWithMembers(req.params.id);
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    if (assignment.teacherId !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden: not your assignment' });
    }

    if (assignment.status !== 'open') {
      return res.status(400).json({ error: 'Assignment already closed' });
    }

    if (expectedAnswer !== assignment.answer) {
      const updatedAssignment = await getAssignmentByIdWithMembers(assignment.id);
      return res.status(409).json({
        error: 'Answer has been updated by the students',
        assignment: updatedAssignment
      });
    }

    await evaluateAssignment(assignment.id, numericScore);
    const updated = await getAssignmentByIdWithMembers(assignment.id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to evaluate assignment' });
  }
});

/**
 * GET /api/student/average
 * Get average score for a student (used in student dashboard).
 * Calculates weighted average across all evaluated assignments for the student.
 */
router.get('/student/average', isLoggedIn, isStudent, async (req, res) => {
  try {
    const avg = await getStudentAverageScore(req.user.id);
    res.json({ average: avg });
  } catch (err) {
    res.status(500).json({ error: 'Failed to calculate average' });
  }
});

/**
 * GET /api/teacher/class-status
 * Get class status for teacher: students, open/closed counts and averages.
 * Provides statistics for all students including assignment counts and scores.
 */
router.get('/teacher/class-status', isLoggedIn, isTeacher, async (req, res) => {
  try {
    const stats = await getClassStatusForTeacher(req.user.id);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch class status' });
  }
});

/**
 * POST /api/students/eligible
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
    res.status(500).json({ error: 'Failed to determine eligible students' });
  }
});

/**
 * GET /api/students
 * Get all students (teacher only) - used for creating assignments.
 * Returns complete list of students for teacher assignment creation interface.
 */
router.get('/students', isLoggedIn, isTeacher, async (req, res) => {
  try {
    const students = await getAllStudents();
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

export default router;
