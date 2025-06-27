import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Initialize and open a SQLite database connection.
 *
 * @returns {Promise<sqlite3.Database>} - An open database instance
 */
export default async function initDB() {
  return open({
    filename: path.join(__dirname, '../db/sample_compiti.db'),
    driver: sqlite3.Database
  });
}
