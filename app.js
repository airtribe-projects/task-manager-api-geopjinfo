const express = require("express");
require('dotenv').config(); 
const tasksRouter = require('./src/routes/tasks.routes');  
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

const app = express();
const port = +(process.env.PORT ?? 3000);

const swaggerDocument = YAML.load(path.join(__dirname, './swagger/openapi.yml'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, { explorer: true })
);

app.use('/tasks', tasksRouter);

app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.listen(port, (err) => {
  if (err) {
    return console.log("Something bad happened", err);
  }
  console.log(`✅ Server is listening on ${port}`);
});

module.exports = app;
