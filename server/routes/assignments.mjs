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
  console.log(`[API] GET /assignments - User: ${req.user.name} (${req.user.role})`);
  try {
    if (req.user.role === 'student') {
      const assignments = await getAssignmentsForStudent(req.user.id);
      console.log(`[API] Retrieved ${assignments.length} assignments for student ${req.user.name}`);
      res.json(assignments);
    } else if (req.user.role === 'teacher') {
      const assignments = await getAssignmentsByTeacher(req.user.id);
      console.log(`[API] Retrieved ${assignments.length} assignments for teacher ${req.user.name}`);
      res.json(assignments);
    } else {
      console.log(`[API] Invalid role: ${req.user.role}`);
      res.status(403).json({ error: 'Invalid role' });
    }
  } catch (err) {
    console.error(`[API] Error fetching assignments for ${req.user.name}:`, err.message);
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
  console.log(`[API] GET /assignments/${req.params.id} - User: ${req.user.name} (${req.user.role})`);
  try {
    const assignment = await getAssignmentByIdWithMembers(req.params.id);
    
    if (!assignment) {
      console.log(`[API] Assignment ${req.params.id} not found`);
      return res.status(404).json({ error: 'Assignment not found' });
    }

    // Role-based access control
    const isStudentInGroup = assignment.groupMembers.some(m => m.studentId === req.user.id);

    if (
      (req.user.role === 'teacher' && assignment.teacherId !== req.user.id) ||
      (req.user.role === 'student' && !isStudentInGroup)
    ) {
      console.log(`[API] Access denied for ${req.user.name} to assignment ${req.params.id}`);
      return res.status(403).json({ error: 'Forbidden' });
    }

    console.log(`[API] Assignment ${req.params.id} retrieved successfully for ${req.user.name}`);
    res.json(assignment);
  } catch (err) {
    console.error(`[API] Error fetching assignment ${req.params.id}:`, err.message);
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
  console.log(`[API] POST /assignments - Teacher: ${req.user.name} creating new assignment`);
  
  if (typeof question !== 'string' || question.trim().length === 0) {
    console.log(`[API] Invalid question provided by ${req.user.name}`);
    return res.status(400).json({ error: 'Question cannot be empty' });
  }

  try {
    const id = await createAssignment({ teacherId: req.user.id, question });
    console.log(`[API] Assignment ${id} created successfully by teacher ${req.user.name}`);
    res.status(201).json({ id });
  } catch (err) {
    console.error(`[API] Error creating assignment for ${req.user.name}:`, err.message);
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
  console.log(`[API] POST /assignments/${req.params.id}/group - Teacher: ${req.user.name} assigning group of ${studentIds?.length || 0} students`);

  if (!Array.isArray(studentIds) || studentIds.length < 2 || studentIds.length > 6) {
    console.log(`[API] Invalid group size: ${studentIds?.length || 0} students`);
    return res.status(400).json({ error: 'Group must have between 2 and 6 students' });
  }

  try {
    const assignment = await getAssignmentByIdWithMembers(req.params.id);
    if (!assignment) {
      console.log(`[API] Assignment ${req.params.id} not found for group assignment`);
      return res.status(404).json({ error: 'Assignment not found' });
    }

    if (assignment.teacherId !== req.user.id) {
      console.log(`[API] Teacher ${req.user.name} tried to assign group to assignment ${req.params.id} (not owner)`);
      return res.status(403).json({ error: 'Forbidden: not your assignment' });
    }

    if (assignment.status !== 'open') {
      console.log(`[API] Cannot assign group to closed assignment ${req.params.id}`);
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
          console.log(`[API] Collaboration limit exceeded for pair (${studentIds[i]}, ${studentIds[j]}): ${count} times`);
          return res.status(400).json({
            error: `Pair (${studentIds[i]}, ${studentIds[j]}) has already worked together 2 times`
          });
        }
      }
    }

    await addGroupMembers(assignment.id, studentIds);
    console.log(`[API] Group assigned successfully to assignment ${assignment.id}: students [${studentIds.join(', ')}]`);
    res.status(204).end();
  } catch (err) {
    console.error(`[API] Error assigning group to assignment ${req.params.id}:`, err.message);
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
  console.log(`[API] PUT /assignments/${req.params.id}/answer - Student: ${req.user.name} submitting answer`);
  
  if (typeof answer !== 'string' || answer.trim().length === 0) {
    console.log(`[API] Empty answer provided by student ${req.user.name}`);
    return res.status(400).json({ error: 'Answer cannot be empty' });
  }

  try {
    const assignment = await getAssignmentByIdWithMembers(req.params.id);
    if (!assignment) {
      console.log(`[API] Assignment ${req.params.id} not found for answer submission`);
      return res.status(404).json({ error: 'Assignment not found' });
    }

    const isInGroup = assignment.groupMembers.some(m => m.studentId === req.user.id);

    if (!isInGroup) {
      console.log(`[API] Student ${req.user.name} not in group for assignment ${req.params.id}`);
      return res.status(403).json({ error: 'You are not in this assignment group' });
    }

    if (assignment.status !== 'open') {
      console.log(`[API] Student ${req.user.name} tried to submit answer to closed assignment ${req.params.id}`);
      const fullAssignment = await getAssignmentByIdWithMembers(assignment.id);
      return res.status(409).json({
        error: 'Assignment already closed',
        assignment: fullAssignment
      });
    }

    await updateAnswer(assignment.id, answer);
    const updated = await getAssignmentByIdWithMembers(assignment.id);
    console.log(`[API] Answer submitted successfully for assignment ${assignment.id} by student ${req.user.name}`);
    res.json(updated);
  } catch (err) {
    console.error(`[API] Error submitting answer for assignment ${req.params.id}:`, err.message);
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
  console.log(`[API] PUT /assignments/${req.params.id}/evaluate - Teacher: ${req.user.name} evaluating with score ${numericScore}`);

  if (!Number.isInteger(numericScore) || numericScore < 0 || numericScore > 30) {
    console.log(`[API] Invalid score ${score} provided by teacher ${req.user.name}`);
    return res.status(400).json({ error: 'Score must be an integer between 0 and 30' });
  }

  try {
    const assignment = await getAssignmentByIdWithMembers(req.params.id);
    if (!assignment) {
      console.log(`[API] Assignment ${req.params.id} not found for evaluation`);
      return res.status(404).json({ error: 'Assignment not found' });
    }

    if (assignment.teacherId !== req.user.id) {
      console.log(`[API] Teacher ${req.user.name} tried to evaluate assignment ${req.params.id} (not owner)`);
      return res.status(403).json({ error: 'Forbidden: not your assignment' });
    }

    if (assignment.status !== 'open') {
      console.log(`[API] Cannot evaluate closed assignment ${req.params.id}`);
      return res.status(400).json({ error: 'Assignment already closed' });
    }

    if (expectedAnswer !== assignment.answer) {
      console.log(`[API] Conflict: answer changed during evaluation of assignment ${req.params.id}`);
      const updatedAssignment = await getAssignmentByIdWithMembers(assignment.id);
      return res.status(409).json({
        error: 'Answer has been updated by the students',
        assignment: updatedAssignment
      });
    }

    await evaluateAssignment(assignment.id, numericScore);
    const updated = await getAssignmentByIdWithMembers(assignment.id);
    console.log(`[API] Assignment ${assignment.id} evaluated successfully with score ${numericScore} by teacher ${req.user.name}`);
    res.json(updated);
  } catch (err) {
    console.error(`[API] Error evaluating assignment ${req.params.id}:`, err.message);
    res.status(500).json({ error: 'Failed to evaluate assignment' });
  }
});

/**
 * GET /api/student/average
 * Get average score for a student (used in student dashboard).
 * Calculates weighted average across all evaluated assignments for the student.
 */
router.get('/student/average', isLoggedIn, isStudent, async (req, res) => {
  console.log(`[API] GET /student/average - Student: ${req.user.name}`);
  try {
    const avg = await getStudentAverageScore(req.user.id);
    console.log(`[API] Average calculated for ${req.user.name}: ${avg}`);
    res.json({ average: avg });
  } catch (err) {
    console.error(`[API] Error calculating average for ${req.user.name}:`, err.message);
    res.status(500).json({ error: 'Failed to calculate average' });
  }
});

/**
 * GET /api/teacher/class-status
 * Get class status for teacher: students, open/closed counts and averages.
 * Provides statistics for all students including assignment counts and scores.
 */
router.get('/teacher/class-status', isLoggedIn, isTeacher, async (req, res) => {
  console.log(`[API] GET /teacher/class-status - Teacher: ${req.user.name}`);
  try {
    const stats = await getClassStatusForTeacher(req.user.id);
    console.log(`[API] Class status retrieved for teacher ${req.user.name}: ${stats.length} students`);
    res.json(stats);
  } catch (err) {
    console.error(`[API] Error fetching class status for ${req.user.name}:`, err.message);
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
  console.log(`[API] POST /students/eligible - Teacher: ${req.user.name} checking eligibility for ${selectedIds?.length || 0} selected students`);

  if (!Array.isArray(selectedIds)) {
    console.log(`[API] Invalid selectedIds format for teacher ${req.user.name}`);
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

    console.log(`[API] Found ${eligible.length} eligible students out of ${allStudents.length} total for teacher ${req.user.name}`);
    res.json(eligible);
  } catch (err) {
    console.error(`[API] Error determining eligible students for ${req.user.name}:`, err.message);
    res.status(500).json({ error: 'Failed to determine eligible students' });
  }
});

/**
 * GET /api/students
 * Get all students (teacher only) - used for creating assignments.
 * Returns complete list of students for teacher assignment creation interface.
 */
router.get('/students', isLoggedIn, isTeacher, async (req, res) => {
  console.log(`[API] GET /students - Teacher: ${req.user.name}`);
  try {
    const students = await getAllStudents();
    console.log(`[API] Retrieved ${students.length} students for teacher ${req.user.name}`);
    res.json(students);
  } catch (err) {
    console.error(`[API] Error fetching students for ${req.user.name}:`, err.message);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

export default router;
