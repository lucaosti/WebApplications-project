import initDB from './db.js';

/**
 * Add multiple students to an assignment group.
 *
 * @param {number} assignmentId - The ID of the assignment
 * @param {Array<number>} studentIds - Array of student IDs to be added
 */
export async function addGroupMembers(assignmentId, studentIds) {
  const db = await initDB();
  const insert = 'INSERT INTO GroupMembers (assignmentId, studentId) VALUES (?, ?)';
  for (const studentId of studentIds) {
    await db.run(insert, [assignmentId, studentId]);
  }
}

/**
 * Retrieve the list of students assigned to a specific assignment,
 * including their names.
 *
 * @param {number} assignmentId - The assignment ID
 * @returns {Promise<Array>} - Array of group member entries with studentId and name
 */
export async function getGroupMembers(assignmentId) {
  const db = await initDB();
  return db.all(
    `SELECT gm.assignmentId, gm.studentId, u.name AS studentName
     FROM GroupMembers gm
     JOIN Users u ON gm.studentId = u.id
     WHERE gm.assignmentId = ?`,
    [assignmentId]
  );
}

/**
 * Count how many times two students have been in the same group
 * for assignments created by the same teacher.
 *
 * @param {number} teacherId - The teacher's user ID
 * @param {number} studentId1 - First student ID
 * @param {number} studentId2 - Second student ID
 * @returns {Promise<Object>} - Object with a 'count' property
 */
export async function countGroupParticipations(teacherId, studentId1, studentId2) {
  const db = await initDB();
  return db.get(
    `SELECT COUNT(*) AS count
     FROM GroupMembers gm1
     JOIN GroupMembers gm2 ON gm1.assignmentId = gm2.assignmentId
     JOIN Assignments a ON gm1.assignmentId = a.id
     WHERE gm1.studentId = ?
       AND gm2.studentId = ?
       AND a.teacherId = ?`,
    [studentId1, studentId2, teacherId]
  );
}
