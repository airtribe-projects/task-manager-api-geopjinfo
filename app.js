const express = require("express");
const fs = require("fs");
require("dotenv").config();
const tasksRouter = require("./src/routes/tasks.routes");
const path = require("path");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");

const app = express();
const parsedPort = Number.parseInt(process.env.PORT ?? "", 10);
const port = Number.isNaN(parsedPort) ? 3000 : parsedPort;

const swaggerPath = path.join(__dirname, "./swagger/openapi.yml");
let swaggerDocument = {
  openapi: "3.0.0",
  info: { title: "Task Manager API", version: "1.0.0" },
  paths: {},
};
try {
  const swaggerText = fs.readFileSync(swaggerPath, "utf8");
  swaggerDocument = YAML.parse(swaggerText);
} catch (err) {
  console.error("Failed to parse OpenAPI spec:", err.message);
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, { explorer: true })
);

app.get("/", (req, res) => {
  res.redirect("/api-docs/");
});

app.use("/tasks", tasksRouter);

app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.listen(port, (err) => {
  if (err) {
    console.error("Something bad happened", err);
    return;
  }
  console.log(`✅ Server is listening on ${port}`);
});

module.exports = app;
