process.env.DB_FILE = ':memory:';

const request = require('supertest');
const app = require('../app');
const db = require('../db');

function resetDatabase() {
  db.prepare('DELETE FROM todos').run();

  try {
    db.prepare("DELETE FROM sqlite_sequence WHERE name = 'todos'").run();
  } catch {
    // sqlite_sequence only exists when AUTOINCREMENT has been used.
  }
}

beforeEach(() => {
  resetDatabase();
});

afterAll(() => {
  db.close();
});

describe('Todo API', () => {
  test('POST /todos creates a todo', async () => {
    const response = await request(app)
      .post('/todos')
      .send({
        title: 'Buy groceries',
        status: 'backlog',
        due_date: '2026-07-15'
      })
      .expect(201);

    expect(response.body).toMatchObject({
      id: 1,
      title: 'Buy groceries',
      status: 'backlog',
      due_date: '2026-07-15'
    });
  });

  test('POST /todos defaults status to backlog', async () => {
    const response = await request(app)
      .post('/todos')
      .send({
        title: 'Buy milk'
      })
      .expect(201);

    expect(response.body.status).toBe('backlog');
    expect(response.body.due_date).toBeNull();
  });

  test('POST /todos rejects missing title', async () => {
    const response = await request(app)
      .post('/todos')
      .send({
        status: 'backlog'
      })
      .expect(400);

    expect(response.body.error).toBe('title required');
  });

  test('POST /todos rejects invalid status', async () => {
    const response = await request(app)
      .post('/todos')
      .send({
        title: 'Invalid status test',
        status: 'started'
      })
      .expect(400);

    expect(response.body.error).toContain('status must be one of');
  });

  test('POST /todos rejects invalid due_date', async () => {
    const response = await request(app)
      .post('/todos')
      .send({
        title: 'Bad date',
        due_date: '2026-02-30'
      })
      .expect(400);

    expect(response.body.error).toBe('due_date must be YYYY-MM-DD');
  });

  test('GET /todos lists all todos sorted by due date', async () => {
    await request(app)
      .post('/todos')
      .send({
        title: 'Later todo',
        due_date: '2026-08-01'
      });

    await request(app)
      .post('/todos')
      .send({
        title: 'Earlier todo',
        due_date: '2026-07-15'
      });

    const response = await request(app)
      .get('/todos')
      .expect(200);

    expect(response.body).toHaveLength(2);
    expect(response.body[0].title).toBe('Earlier todo');
    expect(response.body[1].title).toBe('Later todo');
  });

  test('GET /todos?status=in_progress filters todos by status', async () => {
    await request(app)
      .post('/todos')
      .send({
        title: 'Backlog todo',
        status: 'backlog'
      });

    await request(app)
      .post('/todos')
      .send({
        title: 'In progress todo',
        status: 'in_progress'
      });

    const response = await request(app)
      .get('/todos?status=in_progress')
      .expect(200);

    expect(response.body).toHaveLength(1);
    expect(response.body[0].title).toBe('In progress todo');
    expect(response.body[0].status).toBe('in_progress');
  });

  test('GET /todos?status=bad rejects invalid status filter', async () => {
    const response = await request(app)
      .get('/todos?status=bad')
      .expect(400);

    expect(response.body.error).toContain('status must be one of');
  });

  test('GET /todos/:id returns one todo', async () => {
    await request(app)
      .post('/todos')
      .send({
        title: 'Single todo'
      })
      .expect(201);

    const response = await request(app)
      .get('/todos/1')
      .expect(200);

    expect(response.body.title).toBe('Single todo');
  });

  test('GET /todos/:id returns 404 for missing todo', async () => {
    const response = await request(app)
      .get('/todos/999')
      .expect(404);

    expect(response.body.error).toBe('Not found');
  });

  test('PATCH /todos/:id/status updates todo status', async () => {
    await request(app)
      .post('/todos')
      .send({
        title: 'Change status',
        status: 'backlog'
      })
      .expect(201);

    const response = await request(app)
      .patch('/todos/1/status')
      .send({
        status: 'completed'
      })
      .expect(200);

    expect(response.body.status).toBe('completed');
  });

  test('PUT /todos/:id updates todo title', async () => {
    await request(app)
      .post('/todos')
      .send({
        title: 'Buy groceries'
      })
      .expect(201);

    const response = await request(app)
      .put('/todos/1')
      .send({
        title: 'Buy groceries and milk'
      })
      .expect(200);

    expect(response.body.title).toBe('Buy groceries and milk');
  });

  test('PUT /todos/:id can clear due_date', async () => {
    await request(app)
      .post('/todos')
      .send({
        title: 'Todo with due date',
        due_date: '2026-07-15'
      })
      .expect(201);

    const response = await request(app)
      .put('/todos/1')
      .send({
        due_date: null
      })
      .expect(200);

    expect(response.body.due_date).toBeNull();
  });

  test('DELETE /todos/:id deletes todo', async () => {
    await request(app)
      .post('/todos')
      .send({
        title: 'Delete me'
      })
      .expect(201);

    await request(app)
      .delete('/todos/1')
      .expect(204);

    await request(app)
      .get('/todos/1')
      .expect(404);
  });
});