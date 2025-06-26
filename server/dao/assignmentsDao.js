const initDB = require('./db');

/**
 * Retrieves a single assignment by its ID.
 */
async function getAssignmentById(id) {
  const db = await initDB();
  return db.get('SELECT * FROM Assignments WHERE id = ?', [id]);
}

/**
 * Retrieves all assignments created by a specific teacher.
 */
async function getAssignmentsByTeacher(teacherId) {
  const db = await initDB();
  return db.all(
    'SELECT * FROM Assignments WHERE teacherId = ? ORDER BY createdAt DESC',
    [teacherId]
  );
}

/**
 * Retrieves all assignments where the given student is in the group.
 */
async function getAssignmentsForStudent(studentId) {
  const db = await initDB();
  return db.all(
    `SELECT a.*
     FROM Assignments a
     JOIN GroupMembers g ON a.id = g.assignmentId
     WHERE g.studentId = ?
     ORDER BY a.createdAt DESC`,
    [studentId]
  );
}

/**
 * Creates a new assignment and returns its ID.
 * createdAt is automatically handled by SQLite (DEFAULT CURRENT_TIMESTAMP).
 */
async function createAssignment({ teacherId, question }) {
  const db = await initDB();
  const res = await db.run(
    'INSERT INTO Assignments (teacherId, question) VALUES (?, ?)', 
    [teacherId, question]
  );
  return res.lastID;
}

/**
 * Saves or updates the answer of a group before evaluation.
 */
async function updateAnswer(assignmentId, answer) {
  const db = await initDB();
  const submittedAt = new Date().toISOString();
  await db.run(
    'UPDATE Assignments SET answer = ?, submittedAt = ? WHERE id = ? AND status = "open"',
    [answer, submittedAt, assignmentId]
  );
}

/**
 * Assigns a score to a submitted assignment and closes it.
 */
async function evaluateAssignment(assignmentId, score) {
  const db = await initDB();
  const evaluatedAt = new Date().toISOString();
  await db.run(
    'UPDATE Assignments SET score = ?, evaluatedAt = ? WHERE id = ?',
    [score, evaluatedAt, assignmentId]
  );
}

module.exports = {
  getAssignmentsByTeacher,
  getAssignmentsForStudent,
  getAssignmentById,
  createAssignment,
  updateAnswer,
  evaluateAssignment
};
