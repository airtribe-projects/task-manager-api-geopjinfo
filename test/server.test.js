const tap = require("tap");
const supertest = require("supertest");
const app = require("../app");
const server = supertest(app);

tap.test("POST /tasks", async (t) => {
  const newTask = {
    title: "New Task",
    description: "New Task Description",
    completed: false,
  };
  const response = await server.post("/tasks").send(newTask);
  t.equal(response.status, 201);
  t.end();
});

tap.test("POST /tasks with invalid data", async (t) => {
  const newTask = {
    title: "New Task",
  };
  const response = await server.post("/tasks").send(newTask);
  t.equal(response.status, 400);
  t.end();
});

tap.test("GET /tasks", async (t) => {
  const response = await server.get("/tasks");
  t.equal(response.status, 200);
  t.hasOwnProp(response.body[0], "id");
  t.hasOwnProp(response.body[0], "title");
  t.hasOwnProp(response.body[0], "description");
  t.hasOwnProp(response.body[0], "completed");
  t.type(response.body[0].id, "number");
  t.type(response.body[0].title, "string");
  t.type(response.body[0].description, "string");
  t.type(response.body[0].completed, "boolean");
  t.end();
});

tap.test("GET /tasks/:id", async (t) => {
  const response = await server.get("/tasks/1");
  t.equal(response.status, 200);
  const expectedTask = {
    id: 1,
    title: "Set up environment",
    description: "Install Node.js, npm, and git",
    completed: true,
  };
  t.match(response.body, expectedTask);
  t.end();
});

tap.test("GET /tasks/:id with invalid id", async (t) => {
  const response = await server.get("/tasks/999");
  t.equal(response.status, 404);
  t.end();
});

tap.test("PUT /tasks/:id", async (t) => {
  const updatedTask = {
    title: "Updated Task",
    description: "Updated Task Description",
    completed: true,
  };
  const response = await server.put("/tasks/1").send(updatedTask);
  t.equal(response.status, 200);
  t.end();
});

tap.test("PUT /tasks/:id with invalid id", async (t) => {
  const updatedTask = {
    title: "Updated Task",
    description: "Updated Task Description",
    completed: true,
  };
  const response = await server.put("/tasks/999").send(updatedTask);
  t.equal(response.status, 404);
  t.end();
});

tap.test("PUT /tasks/:id with invalid data", async (t) => {
  const updatedTask = {
    title: "Updated Task",
    description: "Updated Task Description",
    completed: "true",
  };
  const response = await server.put("/tasks/1").send(updatedTask);
  t.equal(response.status, 400);
  t.end();
});

tap.test("PUT /tasks/:id (invalid priority)", async (t) => {
  const bad = {
    title: "Task",
    description: "Desc",
    completed: false,
    priority: "urgent",
  };
  const res = await server.put("/tasks/1").send(bad);
  t.equal(res.status, 400);
  t.end();
});

tap.test("DELETE /tasks/:id", async (t) => {
  const response = await server.delete("/tasks/1");
  t.equal(response.status, 200);
  t.end();
});

tap.test("DELETE /tasks/:id with invalid id", async (t) => {
  const response = await server.delete("/tasks/999");
  t.equal(response.status, 404);
  t.end();
});

tap.test("GET /tasks?completed=true", async (t) => {
  const res = await server.get("/tasks?completed=true");
  t.equal(res.status, 200);
  res.body.forEach((task) => t.equal(task.completed, true));
  t.end();
});

tap.test("GET /tasks?completed=false", async (t) => {
  const res = await server.get("/tasks?completed=false");
  t.equal(res.status, 200);
  res.body.forEach((task) => t.equal(task.completed, false));
  t.end();
});

tap.test("GET /tasks sorted by createdAt ascending", async (t) => {
  const res = await server.get("/tasks");
  t.equal(res.status, 200);
  const times = res.body.map((x) => {
    return Date.parse(x.createdAt);
  });
  const sorted = [...times].sort((a, b) => a - b);
  t.same(times, sorted, "times are in non-decreasing order");
  t.end();
});

tap.test("GET /tasks/priority/:level", async (t) => {
  const level = "low";
  const res = await server.get(`/tasks/priority/${level}`);
  t.equal(res.status, 200);
  res.body.forEach((task) => t.equal(task.priority, level));
  t.end();
});

tap.test("GET /tasks/priority/:level with invalid level", async (t) => {
  const res = await server.get("/tasks/priority/invalid");
  t.equal(res.status, 400);
  t.end();
});

tap.teardown(() => {
  process.exit(0);
});
