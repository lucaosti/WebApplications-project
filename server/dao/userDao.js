const initDB = require('./db');

/**
 * Retrieves a user by their username (for login).
 */
async function getUserByName(name) {
  const db = await initDB();
  return db.get('SELECT * FROM Users WHERE name = ?', [name]);
}

/**
 * Retrieves a user by their unique ID.
 */
async function getUserById(id) {
  const db = await initDB();
  return db.get('SELECT * FROM Users WHERE id = ?', [id]);
}

/**
 * Returns all users with the role 'student'.
 */
async function getAllStudents() {
  const db = await initDB();
  return db.all('SELECT * FROM Users WHERE role = "student"');
}

module.exports = {
  getUserByName,
  getUserById,
  getAllStudents
};
