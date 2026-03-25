const fs = require("fs");
const path = require("path");

const { PRIORITIES, PRIORITY_LIST } = require("../constants/priority.enum");

const file = path.resolve(__dirname, "../../task.json");
const allowedTaskFields = new Set(["title", "description", "completed", "priority"]);
const nowIso = () => new Date().toISOString();

function validateAcceptedFields(payload) {
  const keys = Object.keys(payload ?? {});
  const invalid = keys.filter((key) => !allowedTaskFields.has(key));
  if (invalid.length > 0) {
    throw new Error(`Unexpected fields: ${invalid.join(", ")}`);
  }
}

console.log("Loading tasks");
if (!fs.existsSync(file)) {
  console.log("Creating empty task.json file");
  fs.writeFileSync(file, JSON.stringify({ tasks: [] }, null, 2));
}

let tasks = [];
try {
  const raw = fs.readFileSync(file, "utf8");
  const parsed = JSON.parse(raw);
  tasks = Array.isArray(parsed) ? parsed : parsed.tasks;
  if (!Array.isArray(tasks)) {
    throw new Error(`Should be an array, but got ${typeof tasks}.`);
  }

  tasks = tasks.map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description,
    completed: t.completed,
    priority: PRIORITY_LIST.includes(t.priority)
      ? t.priority
      : PRIORITY_LIST[0],
    createdAt: t.createdAt,
  }));
} catch (err) {
  console.error("Failed to load task.json:", err);
  tasks = [];
}

function writeTasksToFile() {
  if (process.env.ENABLE_TASKS_PERSISTENCE === "false") return;
  try {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, JSON.stringify({ tasks }, null, 2));
  } catch (err) {
    throw new Error(`Failed to persist tasks: ${err.message}`);
  }
}

exports.getAll = () => tasks;

exports.getById = (id) => tasks.find((t) => t.id === id);

exports.getByPriority = (level) => tasks.filter((t) => t.priority === level);

exports.create = ({
  title,
  description,
  completed,
  priority = PRIORITIES.LOW,
}) => {
  validateAcceptedFields({ title, description, completed, priority });
  if (!PRIORITY_LIST.includes(priority)) {
    throw new Error(`Invalid priority "${priority}"`);
  }
  const id = tasks.length ? Math.max(...tasks.map((t) => t.id)) + 1 : 1;
  const newTask = {
    id,
    title,
    description,
    completed,
    priority,
    createdAt: nowIso(),
  };
  tasks.push(newTask);
  writeTasksToFile();
  return newTask;
};

exports.update = (id, { title, description, completed, priority }) => {
  validateAcceptedFields({ title, description, completed, priority });
  const idx = tasks.findIndex((t) => t.id === id);
  if (idx === -1) return null;
  const createdAt = tasks[idx].createdAt ?? nowIso();
  const nextPriority = priority ?? tasks[idx].priority ?? PRIORITY_LIST[0];
  if (!PRIORITY_LIST.includes(nextPriority)) {
    throw new Error(`Invalid priority "${nextPriority}"`);
  }
  tasks[idx] = {
    id,
    title,
    description,
    completed,
    priority: nextPriority,
    createdAt,
  };
  writeTasksToFile();
  return tasks[idx];
};

exports.remove = (id) => {
  const idx = tasks.findIndex((t) => t.id === id);
  if (idx === -1) return false;
  tasks.splice(idx, 1);
  writeTasksToFile();
  return true;
};
