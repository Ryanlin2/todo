const express = require('express');
const db = require('./db');

const app = express();
app.use(express.json());

const VALID_STATUSES = ['backlog', 'in_progress', 'completed'];

// Validate an ISO date string (YYYY-MM-DD)
function isValidDate(str) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(str)) return false;
  const d = new Date(str);
  return !isNaN(d.getTime());
}

// GET all todos (optional ?status= filter)
app.get('/todos', (req, res) => {
  const { status } = req.query;
  let todos;
  if (status) {
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: `status must be one of: ${VALID_STATUSES.join(', ')}` });
    }
    todos = db
      .prepare('SELECT * FROM todos WHERE status = ? ORDER BY due_date IS NULL, due_date ASC')
      .all(status);
  } else {
    todos = db.prepare('SELECT * FROM todos ORDER BY due_date IS NULL, due_date ASC').all();
  }
  res.json(todos);
});

// GET one todo
app.get('/todos/:id', (req, res) => {
  const todo = db.prepare('SELECT * FROM todos WHERE id = ?').get(req.params.id);
  if (!todo) return res.status(404).json({ error: 'Not found' });
  res.json(todo);
});

// POST create todo
app.post('/todos', (req, res) => {
  const { title, status = 'backlog', due_date = null } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'title required' });
  }
  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: `status must be one of: ${VALID_STATUSES.join(', ')}` });
  }
  if (due_date !== null && !isValidDate(due_date)) {
    return res.status(400).json({ error: 'due_date must be YYYY-MM-DD' });
  }

  const result = db
    .prepare('INSERT INTO todos (title, status, due_date) VALUES (?, ?, ?)')
    .run(title.trim(), status, due_date);
  const todo = db.prepare('SELECT * FROM todos WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(todo);
});

// PUT update todo (title, status, and/or due_date)
app.put('/todos/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM todos WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Not found' });

  const title = req.body.title ?? existing.title;
  const status = req.body.status ?? existing.status;
  // Allow explicitly setting due_date to null to clear it
  const due_date = req.body.due_date !== undefined ? req.body.due_date : existing.due_date;

  if (!title.trim()) {
    return res.status(400).json({ error: 'title cannot be empty' });
  }
  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: `status must be one of: ${VALID_STATUSES.join(', ')}` });
  }
  if (due_date !== null && !isValidDate(due_date)) {
    return res.status(400).json({ error: 'due_date must be YYYY-MM-DD or null' });
  }

  db.prepare('UPDATE todos SET title = ?, status = ?, due_date = ? WHERE id = ?')
    .run(title.trim(), status, due_date, req.params.id);

  res.json(db.prepare('SELECT * FROM todos WHERE id = ?').get(req.params.id));
});

// PATCH update status only
app.patch('/todos/:id/status', (req, res) => {
  const { status } = req.body;
  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: `status must be one of: ${VALID_STATUSES.join(', ')}` });
  }
  const result = db.prepare('UPDATE todos SET status = ? WHERE id = ?').run(status, req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Not found' });
  res.json(db.prepare('SELECT * FROM todos WHERE id = ?').get(req.params.id));
});

// DELETE todo
app.delete('/todos/:id', (req, res) => {
  const result = db.prepare('DELETE FROM todos WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Not found' });
  res.status(204).send();
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Running on http://localhost:${PORT}`));