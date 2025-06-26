const express = require('express');
const assignmentsDao = require('../dao/assignmentsDao');
const groupDao = require('../dao/groupMembersDao');
const { isLoggedIn, isTeacher, isStudent } = require('../middlewares/auth');

const router = express.Router();

// GET /api/assignments (for the current user)
router.get('/assignments', isLoggedIn, async (req, res) => {
  try {
    if (req.user.role === 'teacher') {
      const assignments = await assignmentsDao.getAssignmentsByTeacher(req.user.id);
      res.json(assignments);
    } else if (req.user.role === 'student') {
      const assignments = await assignmentsDao.getAssignmentsForStudent(req.user.id);
      res.json(assignments);
    } else {
      res.status(403).json({ error: 'Unknown role' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

// POST /api/assignments (teacher only)
router.post('/assignments', isLoggedIn, isTeacher, async (req, res) => {
  try {
    const { question, group } = req.body;

    if (!Array.isArray(group) || group.length < 2 || group.length > 6)
      return res.status(422).json({ error: 'Group size must be between 2 and 6' });

    // Check student pair limits
    for (let i = 0; i < group.length; i++) {
      for (let j = i + 1; j < group.length; j++) {
        const s1 = group[i];
        const s2 = group[j];
        const result = await groupDao.countGroupParticipations(req.user.id, s1, s2);
        if (result.count >= 2) {
          return res.status(422).json({ error: `Students ${s1} and ${s2} have already been grouped twice.` });
        }
      }
    }

    const assignmentId = await assignmentsDao.createAssignment({
      teacherId: req.user.id,
      question
    });
    await groupDao.addGroupMembers(assignmentId, group);
    res.status(201).json({ id: assignmentId });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

// PUT /api/assignments/:id/answer (student only)
router.put('/assignments/:id/answer', isLoggedIn, isStudent, async (req, res) => {
  try {
    const assignmentId = parseInt(req.params.id);
    const { answer } = req.body;
    if (!answer) return res.status(400).json({ error: 'Missing answer text' });

    const group = await groupDao.getGroupMembers(assignmentId);
    const isInGroup = group.some(member => member.studentId === req.user.id);
    if (!isInGroup) return res.status(403).json({ error: 'You are not part of this group' });

    await assignmentsDao.updateAnswer(assignmentId, answer);
    res.status(200).json({ message: 'Answer submitted' });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

// PUT /api/assignments/:id/grade (teacher only)
router.put('/assignments/:id/grade', isLoggedIn, isTeacher, async (req, res) => {
  try {
    const assignmentId = parseInt(req.params.id);
    const { score } = req.body;
    if (score == null || score < 0 || score > 30)
      return res.status(400).json({ error: 'Score must be between 0 and 30' });

    const assignment = await assignmentsDao.getAssignmentById(assignmentId);
    if (!assignment) return res.status(404).json({ error: 'Assignment not found' });
    if (assignment.teacherId !== req.user.id)
      return res.status(403).json({ error: 'Not your assignment' });
    if (assignment.evaluatedAt) {
      return res.status(400).json({ error: 'Assignment already evaluated' });
    }

    await assignmentsDao.evaluateAssignment(assignmentId, score);
    res.status(200).json({ message: 'Assignment evaluated' });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

// GET /api/assignments/:id/group (logged-in users only)
router.get('/assignments/:id/group', isLoggedIn, async (req, res) => {
  try {
    const assignmentId = parseInt(req.params.id);
    const assignment = await assignmentsDao.getAssignmentById(assignmentId);
    if (!assignment) return res.status(404).json({ error: 'Assignment not found' });

    // Only teacher who created it or a group member can view
    if (
      req.user.role === 'teacher' && 
      assignment.teacherId !== req.user.id ||
      req.user.role === 'student'
    ) {
      const group = await groupDao.getGroupMembers(assignmentId);
      const isInGroup = group.some(member => member.studentId === req.user.id);
      if (!isInGroup && req.user.role === 'student') {
        return res.status(403).json({ error: 'You are not part of this group' });
      }
    }

    const group = await groupDao.getGroupMembers(assignmentId);
    res.json(group);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;