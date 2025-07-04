import initDB from './db.mjs';

/**
 * Retrieve a user by their name (used for login authentication).
 *
 * @param {string} name - The user name to search for
 * @returns {Promise<Object|null>} - The user object with password hash or null if not found
 */
export async function getUserByName(name) {
  const db = await initDB();
  return db.get(
    'SELECT id, name, role, passwordHash FROM Users WHERE name = ?',
    [name]
  );
}


/**
 * Retrieve a user by their ID (used for session deserialization).
 *
 * @param {number} id - The user ID to search for
 * @returns {Promise<Object|null>} - The user object or null if not found
 */
export async function getUserById(id) {
  const db = await initDB();
  return db.get(
    'SELECT id, name, role, passwordHash FROM Users WHERE id = ?',
    [id]
  );
}


/**
 * Retrieve all users with role 'student' (used for assignment creation).
 *
 * @returns {Promise<Array>} - An array of student user objects
 */
export async function getAllStudents() {
  const db = await initDB();
  return db.all('SELECT * FROM Users WHERE role = "student"');
}
