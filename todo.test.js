// todos.test.js
const request = require("supertest");

const BASE_URL = "http://localhost:3000";

describe("Todos API", () => {
  let todoId;

  test("Add a todo", async () => {
    const res = await request(BASE_URL)
      .post("/todos")
      .send({
        title: "Buy groceries",
        status: "backlog",
        due_date: "2026-07-15",
      })
      .set("Content-Type", "application/json");

    expect(res.status).toBeGreaterThanOrEqual(200);
    expect(res.status).toBeLessThan(300);

    expect(res.body).toHaveProperty("id");
    expect(res.body.title).toBe("Buy groceries");
    expect(res.body.status).toBe("backlog");
    expect(res.body.due_date).toBe("2026-07-15");

    todoId = res.body.id;
  });

  test("List all todos", async () => {
    const res = await request(BASE_URL).get("/todos");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("List only in-progress todos", async () => {
    const res = await request(BASE_URL).get("/todos?status=in_progress");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);

    for (const todo of res.body) {
      expect(todo.status).toBe("in_progress");
    }
  });

  test("Change status from backlog to in_progress", async () => {
    const res = await request(BASE_URL)
      .patch(`/todos/${todoId}/status`)
      .send({
        status: "in_progress",
      })
      .set("Content-Type", "application/json");

    expect(res.status).toBeGreaterThanOrEqual(200);
    expect(res.status).toBeLessThan(300);

    expect(res.body.id).toBe(todoId);
    expect(res.body.status).toBe("in_progress");
  });

  test("Change status from in_progress to completed", async () => {
    const res = await request(BASE_URL)
      .patch(`/todos/${todoId}/status`)
      .send({
        status: "completed",
      })
      .set("Content-Type", "application/json");

    expect(res.status).toBeGreaterThanOrEqual(200);
    expect(res.status).toBeLessThan(300);

    expect(res.body.id).toBe(todoId);
    expect(res.body.status).toBe("completed");
  });

  test("Update title", async () => {
    const res = await request(BASE_URL)
      .put(`/todos/${todoId}`)
      .send({
        title: "Buy groceries and milk",
      })
      .set("Content-Type", "application/json");

    expect(res.status).toBeGreaterThanOrEqual(200);
    expect(res.status).toBeLessThan(300);

    expect(res.body.id).toBe(todoId);
    expect(res.body.title).toBe("Buy groceries and milk");
  });

  test("Delete todo", async () => {
    const res = await request(BASE_URL).delete(`/todos/${todoId}`);

    expect(res.status).toBeGreaterThanOrEqual(200);
    expect(res.status).toBeLessThan(300);
  });
});