const Database = require('better-sqlite3');
const db = new Database('todos.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'backlog'
      CHECK (status IN ('backlog', 'in_progress', 'completed')),
    due_date TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

module.exports = db;