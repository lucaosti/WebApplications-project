import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { promisify } from 'util';

/**
 * Initialize and configure the SQLite database connection.
 * Promisifies database methods for async/await usage.
 * 
 * @returns {Promise<Object>} - Promisified database instance
 */
export default async function initDB() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const dbPath = path.join(__dirname, '../db/sample_compiti.db');

  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
      if (err) {
        reject(err);
      } else {
        // Promisify the database methods for async/await usage
        db.get = promisify(db.get.bind(db));
        db.all = promisify(db.all.bind(db));
        
        // For db.run, we need to wrap it properly to get the result object
        const originalRun = db.run.bind(db);
        db.run = function(sql, params = []) {
          return new Promise((resolve, reject) => {
            originalRun(sql, params, function(err) {
              if (err) {
                reject(err);
              } else {
                // 'this' refers to the Statement object with lastID and changes
                resolve({
                  lastID: this.lastID,
                  changes: this.changes
                });
              }
            });
          });
        };
        
        resolve(db);
      }
    });
  });
}
