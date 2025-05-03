const { PRIORITIES, PRIORITY_LIST } = require("../constants/priority.enum");
const data = require("../data/task.data");

exports.list = (req, res) => {
  let dataList = data.getAll();
  if (!dataList || dataList.length === 0) {
    return res.status(204).json({ error: "No tasks found" });
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
  if (
    typeof title !== "string" ||
    typeof description !== "string" ||
    typeof completed !== "boolean" ||
    !PRIORITY_LIST.includes(priority)
  ) {
    return res.status(400).json({ error: "Invalid Request Body" });
  }
  const created = data.create({ title, description, completed, priority });
  res.status(201).json(created);
};

exports.update = (req, res) => {
  const id = +req.params.id;
  const { title, description, completed, priority } = req.body;
  if (
    typeof title !== "string" ||
    typeof description !== "string" ||
    typeof completed !== "boolean"
  ) {
    return res.status(400).json({ error: "Invalid Request Body" });
  }
  try {
    const updated = data.update(id, {
      title,
      description,
      completed,
      priority,
    });
    if (!updated) return res.status(404).json({ error: "Invalid Request" });
    res.json(updated);
  } catch (err) {
    return res.status(400).json({ error: err.message });
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
    return res.status(204).json({ error: "No tasks found" });
  }
  res.json(list);
};

exports.remove = (req, res) => {
  const ok = data.remove(+req.params.id);
  if (!ok) return res.status(404).json({ error: "Not found" });
  res.sendStatus(200);
};
