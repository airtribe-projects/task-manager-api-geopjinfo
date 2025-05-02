const fs = require("fs");
const path = require("path");

const { PRIORITIES, PRIORITY_LIST } = require("../constants/priority.enum");

const file = path.join(__dirname, "../../task.json");
console.log("Loading tasks");
if (!fs.existsSync(file)) {
  console.log("Creating empty task.json file");
}

let tasks = [];
try {
  const raw = fs.readFileSync(file, "utf8");
  tasks = JSON.parse(raw).tasks;
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

function _write() {
  if (process.env.ENABLE_TASKS_PERSISTENCE === "false") return;
  fs.writeFileSync(file, JSON.stringify(tasks, null, 2));
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
  const nowIso = () => new Date().toISOString();
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
  _write();
  return newTask;
};

exports.update = (id, { title, description, completed,priority  }) => {
  const idx = tasks.findIndex((t) => t.id === id);
  if (idx === -1) return null;
  const nowIso = () => new Date().toISOString();
  const createdAt = tasks[idx].createdAt ?? nowIso();
  priority = priority || tasks[idx].priority; 
  priority = priority ?? PRIORITY_LIST[0];
  if (!PRIORITY_LIST.includes(priority)) {
    throw new Error(`Invalid priority "${priority}"`);
  }
  tasks[idx] = { id, title, description, completed, priority, createdAt };
  _write();
  return tasks[idx];
};



exports.remove = (id) => {
  const idx = tasks.findIndex((t) => t.id === id);
  if (idx === -1) return false;
  tasks.splice(idx, 1);
  _write();
  return true;
};
