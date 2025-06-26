const initDB = require('./db');

/**
 * Adds a group of studentIds to an assignment.
 * Assumes studentIds is an array of IDs.
 */
async function addGroupMembers(assignmentId, studentIds) {
  const db = await initDB();
  const insert = 'INSERT INTO GroupMembers (assignmentId, studentId) VALUES (?, ?)';
  for (const studentId of studentIds) {
    await db.run(insert, [assignmentId, studentId]);
  }
}

/**
 * Returns the list of students in a specific assignment group.
 */
async function getGroupMembers(assignmentId) {
  const db = await initDB();
  return db.all('SELECT * FROM GroupMembers WHERE assignmentId = ?', [assignmentId]);
}

/**
 * Counts how many times a pair of students have been in a group together
 * in assignments created by the given teacher.
 */
async function countGroupParticipations(teacherId, studentId1, studentId2) {
  const db = await initDB();
  return db.get(
    `SELECT COUNT(*) as count
     FROM GroupMembers gm1
     JOIN GroupMembers gm2 ON gm1.assignmentId = gm2.assignmentId
     JOIN Assignments a ON gm1.assignmentId = a.id
     WHERE gm1.studentId = ? AND gm2.studentId = ? AND a.teacherId = ?`,
    [studentId1, studentId2, teacherId]
  );
}

module.exports = {
  addGroupMembers,
  getGroupMembers,
  countGroupParticipations
};
