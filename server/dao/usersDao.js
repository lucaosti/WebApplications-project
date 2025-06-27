import initDB from './db.js';

/**
 * Retrieve a user by their name (used for login).
 * Uses a callback-based API, wrapped in a Promise.
 */
export async function getUserByName(name) {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    db.get(
      'SELECT id, name, role, passwordHash FROM Users WHERE name = ?',
      [name],
      (err, row) => {
        if (err) reject(err);
        else resolve(row);
      }
    );
  });
}


/**
 * Retrieve a user by their ID.
 *
 * @param {number} id - The user ID
 * @returns {Promise<Object|null>} - The user object or null if not found
 */
export async function getUserById(id) {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    db.get(
      'SELECT id, name, role, passwordHash FROM Users WHERE id = ?',
      [id],
      (err, row) => {
        if (err) reject(err);
        else resolve(row);
      }
    );
  });
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
