import initDB from './db.js';

/**
 * Retrieve a user by their name (used for login).
 *
 * @param {string} name - The username
 * @returns {Promise<Object|null>} - The user object or null if not found
 */
export async function getUserByName(name) {
  const db = await initDB();
  return db.get('SELECT * FROM Users WHERE name = ?', [name]);
}

/**
 * Retrieve a user by their ID.
 *
 * @param {number} id - The user ID
 * @returns {Promise<Object|null>} - The user object or null if not found
 */
export async function getUserById(id) {
  const db = await initDB();
  return db.get('SELECT * FROM Users WHERE id = ?', [id]);
}

/**
 * Retrieve all users with role 'student'.
 *
 * @returns {Promise<Array>} - An array of user objects
 */
export async function getAllStudents() {
  const db = await initDB();
  return db.all('SELECT * FROM Users WHERE role = "student"');
}
