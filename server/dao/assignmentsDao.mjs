import initDB from './db.mjs';

/**
 * Retrieve all assignments created by a specific teacher, including group members.
 *
 * @param {number} teacherId - The teacher's user ID
 * @returns {Promise<Array>} - Array of assignment objects with group members
 */
export async function getAssignmentsByTeacher(teacherId) {
  const db = await initDB();
  const assignments = await db.all(
    'SELECT * FROM Assignments WHERE teacherId = ? ORDER BY createdAt DESC',
    [teacherId]
  );
  
  // For each assignment, get the group members
  for (const assignment of assignments) {
    const members = await db.all(
      `SELECT u.id, u.name 
       FROM GroupMembers gm 
       JOIN Users u ON gm.studentId = u.id 
       WHERE gm.assignmentId = ?
       ORDER BY u.name`,
      [assignment.id]
    );
    assignment.groupMembers = members;
  }
  
  return assignments;
}

/**
 * Retrieve all assignments in which the student is involved, including group members.
 *
 * @param {number} studentId - The student user ID
 * @returns {Promise<Array>} - Array of assignment objects with group members
 */
export async function getAssignmentsForStudent(studentId) {
  const db = await initDB();
  const assignments = await db.all(
    `SELECT a.*, u.name AS teacherName
     FROM Assignments a
     JOIN Users u ON a.teacherId = u.id
     JOIN GroupMembers g ON a.id = g.assignmentId
     WHERE g.studentId = ?
     ORDER BY a.createdAt DESC`,
    [studentId]
  );
  
  // For each assignment, get all group members
  for (const assignment of assignments) {
    const members = await db.all(
      `SELECT u.id, u.name 
       FROM GroupMembers gm 
       JOIN Users u ON gm.studentId = u.id 
       WHERE gm.assignmentId = ?
       ORDER BY u.name`,
      [assignment.id]
    );
    assignment.groupMembers = members;
  }
  
  return assignments;
}

/**
 * Create a new assignment and return its ID.
 *
 * @param {Object} assignment - Assignment data
 * @param {number} assignment.teacherId - The ID of the teacher creating the assignment
 * @param {string} assignment.question - The text of the question
 * @returns {Promise<number>} - The ID of the newly created assignment
 */
export async function createAssignment({ teacherId, question }) {
  const db = await initDB();
  const res = await db.run(
    'INSERT INTO Assignments (teacherId, question) VALUES (?, ?)',
    [teacherId, question]
  );
  return res.lastID;
}

/**
 * Update the answer for a specific assignment, if still open.
 *
 * @param {number} assignmentId - The assignment ID
 * @param {string} answer - The answer text
 */
export async function updateAnswer(assignmentId, answer) {
  const db = await initDB();
  const submittedAt = new Date().toISOString();
  await db.run(
    'UPDATE Assignments SET answer = ?, submittedAt = ? WHERE id = ? AND status = "open"',
    [answer, submittedAt, assignmentId]
  );
}

/**
 * Assign a score to an assignment and mark it as closed.
 *
 * @param {number} assignmentId - The assignment ID
 * @param {number} score - Score between 0 and 30
 */
export async function evaluateAssignment(assignmentId, score) {
  const db = await initDB();
  const evaluatedAt = new Date().toISOString();
  await db.run(
    'UPDATE Assignments SET score = ?, evaluatedAt = ?, status = "closed" WHERE id = ?',
    [score, evaluatedAt, assignmentId]
  );
}

/**
 * Compute the average score of assignments where the student is in the group and the score is not null.
 *
 * @param {number} studentId - The student user ID
 * @returns {Promise<number|null>} - Average score or null if no evaluated assignments
 */
export async function getStudentAverageScore(studentId) {
  const db = await initDB();
  const result = await db.get(
    `
    SELECT
      ROUND(SUM(score * 1.0 / groupSize) / SUM(1.0 / groupSize), 2) AS average
    FROM (
      SELECT
        a.score,
        COUNT(g2.studentId) AS groupSize
      FROM Assignments a
      JOIN GroupMembers g1 ON a.id = g1.assignmentId
      JOIN GroupMembers g2 ON a.id = g2.assignmentId
      WHERE g1.studentId = ?
        AND a.status = 'closed'
        AND a.score IS NOT NULL
      GROUP BY a.id
    ) AS weighted_scores
    `,
    [studentId]
  );
  return result?.average ?? null;
}

/**
 * Get per-student statistics (open/closed assignments and average score) for a teacher's class.
 * Includes ALL students in the system, showing "- 0 0" for those with no assignments from this teacher.
 *
 * @param {number} teacherId - The teacher user ID
 * @returns {Promise<Array>} - Array of student status objects
 */
export async function getClassStatusForTeacher(teacherId) {
  const db = await initDB();
  return db.all(
    `
    WITH GroupSizes AS (
      SELECT
        a.id AS assignmentId,
        COUNT(g2.studentId) AS groupSize
      FROM Assignments a
      JOIN GroupMembers g2 ON a.id = g2.assignmentId
      WHERE a.teacherId = ?
      GROUP BY a.id
    ),
    StudentAssignments AS (
      SELECT
        u.id AS studentId,
        u.name AS studentName,
        a.id AS assignmentId,
        a.status,
        a.score,
        gs.groupSize
      FROM Assignments a
      JOIN GroupMembers g ON a.id = g.assignmentId
      JOIN Users u ON g.studentId = u.id
      JOIN GroupSizes gs ON gs.assignmentId = a.id
      WHERE a.teacherId = ?
    ),
    AllStudents AS (
      SELECT id AS studentId, name AS studentName
      FROM Users 
      WHERE role = 'student'
    )
    SELECT
      s.studentId,
      s.studentName,
      COALESCE(SUM(sa.status = 'open'), 0) AS numOpen,
      COALESCE(SUM(sa.status = 'closed'), 0) AS numClosed,
      ROUND(
        SUM(CASE WHEN sa.status = 'closed' AND sa.score IS NOT NULL THEN sa.score * 1.0 / sa.groupSize ELSE 0 END) /
        NULLIF(SUM(CASE WHEN sa.status = 'closed' AND sa.score IS NOT NULL THEN 1.0 / sa.groupSize ELSE 0 END), 0),
        2
      ) AS avgScore
    FROM AllStudents s
    LEFT JOIN StudentAssignments sa ON s.studentId = sa.studentId
    GROUP BY s.studentId, s.studentName
    ORDER BY s.studentName ASC
    `,
    [teacherId, teacherId]
  );
}

/**
 * Retrieve a single assignment by its ID, including the teacher's name and group members.
 *
 * @param {number} id - The assignment ID
 * @returns {Promise<Object|null>} - The assignment object with group members or null if not found
 */
export async function getAssignmentByIdWithMembers(id) {
  const db = await initDB();
  const assignment = await db.get(
    `SELECT a.*, u.name AS teacherName
     FROM Assignments a
     JOIN Users u ON a.teacherId = u.id
     WHERE a.id = ?`,
    [id]
  );
  
  if (!assignment) return null;
  
  // Get group members
  const members = await db.all(
    `SELECT u.id, u.name 
     FROM GroupMembers gm 
     JOIN Users u ON gm.studentId = u.id 
     WHERE gm.assignmentId = ?
     ORDER BY u.name`,
    [assignment.id]
  );
  
  assignment.groupMembers = members.map(m => ({
    studentId: m.id,
    studentName: m.name
  }));
  
  return assignment;
}
