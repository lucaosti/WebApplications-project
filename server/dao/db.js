const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

async function initDB() {
  return open({
    filename: path.join(__dirname, '../db/sample_compiti.db'),
    driver: sqlite3.Database
  });
}

module.exports = initDB;
