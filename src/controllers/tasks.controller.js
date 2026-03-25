const { PRIORITIES, PRIORITY_LIST } = require("../constants/priority.enum");
const data = require("../data/task.data");

function validateTaskBody({ title, description, completed, priority }, forCreate) {
  if (typeof title !== "string" || title.trim().length === 0) {
    return "Field 'title' must be a non-empty string";
  }
  if (typeof description !== "string" || description.trim().length === 0) {
    return "Field 'description' must be a non-empty string";
  }
  if (typeof completed !== "boolean") {
    return "Field 'completed' must be a boolean";
  }

  if (forCreate || priority !== undefined) {
    if (!PRIORITY_LIST.includes(priority)) {
      return `Field 'priority' must be one of: ${PRIORITY_LIST.join(", ")}`;
    }
  }

  return null;
}

exports.list = (req, res) => {
  let dataList = data.getAll();
  if (!dataList || dataList.length === 0) {
    return res.status(204).send();
  }

  if (req.query.completed != null) {
    const completed = req.query.completed === "true";
    dataList = dataList.filter((t) => t.completed === completed);
  }

  dataList = dataList.slice().sort((a, b) => {
    const timeA = a.createdAt ? Date.parse(a.createdAt) : -Infinity;
    const timeB = b.createdAt ? Date.parse(b.createdAt) : -Infinity;
    return timeA - timeB;
  });

  res.json(dataList);
};

exports.get = (req, res) => {
  const task = data.getById(+req.params.id);
  if (!task) return res.status(404).json({ error: "Not found" });
  res.json(task);
};

exports.create = (req, res) => {
  const { title, description, completed, priority = PRIORITIES.LOW } = req.body;
  const validationError = validateTaskBody(
    { title, description, completed, priority },
    true
  );
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }
  try {
    const created = data.create({ title, description, completed, priority });
    res.status(201).json(created);
  } catch (err) {
    if (err.message.startsWith("Invalid priority")) {
      return res.status(400).json({ error: err.message });
    }
    return res.status(500).json({ error: "Failed to create task" });
  }
};

exports.update = (req, res) => {
  const id = +req.params.id;
  const { title, description, completed, priority } = req.body;
  const validationError = validateTaskBody(
    { title, description, completed, priority },
    false
  );
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }
  try {
    const updated = data.update(id, {
      title,
      description,
      completed,
      priority,
    });
    if (!updated) return res.status(404).json({ error: "Task not found" });
    res.json(updated);
  } catch (err) {
    if (err.message.startsWith("Invalid priority")) {
      return res.status(400).json({ error: err.message });
    }
    return res.status(500).json({ error: "Failed to update task" });
  }
};

exports.getByPriority = (req, res) => {
  const level = req.params.level;
  if (!PRIORITY_LIST.includes(level)) {
    return res.status(400).json({ error: "Invalid priority level" });
  }
  const list = data
    .getByPriority(level)
    .slice()
    .sort((a, b) => {
      const timeA = a.createdAt ? Date.parse(a.createdAt) : -Infinity;
      const timeB = b.createdAt ? Date.parse(b.createdAt) : -Infinity;
      return timeA - timeB;
    });

  if (!list || list.length === 0) {
    return res.status(204).send();
  }
  res.json(list);
};

exports.remove = (req, res) => {
  try {
    const ok = data.remove(+req.params.id);
    if (!ok) return res.status(404).json({ error: "Not found" });
    res.sendStatus(200);
  } catch (err) {
    return res.status(500).json({ error: "Failed to delete task" });
  }
};
