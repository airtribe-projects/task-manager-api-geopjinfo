# Task Manager API

A simple in-memory Task Manager built with Node.js and Express.  
Interface to create, read, update and delete tasks, filter by completion status, sort by creation date, and even query by priority.

## Overview

This simple Restful service keeps tasks in memory (backed by a `task.json` file on disk). Each task has:

- **id** (number)  
- **title** (string)  
- **description** (string)  
- **completed** (boolean)  
- **priority** (`low` | `medium` | `high`)  
- **createdAt** (ISO timestamp, automatically set when a task is created)

Legacy data without `priority` or `createdAt` is gently handled:

- Missing **priority** defaults to `low`  
- Missing or invalid **createdAt** is treated as “no date” (and sorts last)
  
## Project Structure

```cmd
./task-manager-api-geopjinfo
├── task.json                # Seed data for in-memory store
├── swagger
   └── openapi.yml           # Swagger/OpenAPI spec
├── app.js                   # Express app + server
├── ReadMe.md                # Project overview & instructions
├── package.json             # NPM scripts & dependencies
├── .env                     # Environment variables (PORT, ENABLE_TASKS_WRITE)
├── src
│   ├── constants
│   │   └── priority.enum.js  # Priority enum values
│   ├── data
│   │   └── task.data.js      # In-memory data layer
│   ├── controllers           # Business logic & validation
│   │   └── tasks.controller.js 
│   └── routes
│       └── tasks.routes.js    # Express routes
└── test
    └── server.test.js         # Tap/Supertest API tests
```

## Setup

1. **Clone the repo**  
    ```cmd
    git clone https://github.com/airtribe-projects/task-manager-api-geopjinfo.git
    cd task-manager-api-geopjinfo
    ```

2. **Install dependencies**

   ```cmd
   npm install
   ```

3. **Configure environment**
   Create a `.env` file in the project root with any of these settings (defaults shown):

   ```
   PORT=3000
   ENABLE_TASKS_WRITE=true   # set to false to disable writing back to task.json
   ```
4. **Seed data**
   The root `task.json` file holds initial tasks.
5. **Start the server**

   ```cmd
   npm start
   ```

   console log after successful server startup:

   ```
   ✅ Server is listening on 3000
   ```

## API Documentation

Once the server is running, view full API specification via Swagger UI:

```cmd 
http://localhost:3000/api-docs
```

## 🔌 API Endpoints


All task related endpoints routes under `/tasks`.

### 1. List all tasks

```
GET /tasks
```

**Query parameters:**

* `completed=true|false` — filter by completion
* (tasks are always sorted by `createdAt` ascending; undated tasks appear last)

**Response codes:**

* `200 OK` with the task list
* `204 No Content` if no tasks in list

**Example:**

```cmd
curl http://localhost:3000/tasks?completed=false
```

### 2. Get a specific task

```
GET /tasks/:id
```

**Response codes:**

* `200 OK` with the task object
* `404 Not Found` if no task has that `id`

**Example:**

```cmd
curl http://localhost:3000/tasks/3
```

### 3. Create a new task

```
POST /tasks
```

**Request body (JSON):**

```json
{
  "title": "Write README",
  "description": "Draft project README file",
  "completed": false,
  "priority": "medium"
}
```

* `priority` must be one of `low`, `medium`, `high`.
* `createdAt` will be set automatically.

**Response:**

* `201 Created` with the new task (including `id` and `createdAt`)
* `400 Bad Request` missing required fields or give an invalid priority

**Example:**

```cmd
curl -X POST http://localhost:3000/tasks \
     -H "Content-Type: application/json" \
     -d '{"title":"Write README","description":"Draft file","completed":false,"priority":"medium"}'
```

### 4. Update an existing task

```
PUT /tasks/:id
```

**Request body:** exactly the same as `POST /tasks` (all fields required).

**Response codes:**

* `200 OK` with the updated task
* `400 Bad Request` if data is invalid
* `404 Not Found` if no task has that `id`

**Example:**

```cmd
curl -X PUT http://localhost:3000/tasks/2 \
     -H "Content-Type: application/json" \
     -d '{"title":"Fix bug #42","description":"Details...","completed":true,"priority":"high"}'
```

### 5. Delete a task

```
DELETE /tasks/:id
```

**Response codes:**

* `200 OK` on success
* `404 Not Found` if no task has that `id`

**Example:**

```cmd
curl -X DELETE http://localhost:3000/tasks/5
```

### 6. Get tasks by priority

```
GET /tasks/priority/:level
```

`:level` must be `low`, `medium`, or `high`.
Tasks are returned sorted by creation date, with undated tasks last.

**Response codes:**

* `200 OK` with an array of matching tasks
* `400 Bad Request` if `:level` isn’t one of the valid priorities

**Example:**

```cmd
curl http://localhost:3000/tasks/priority/high
```

## Testing the API

We use **Tap** and **Supertest** for automated endpoint tests:

```cmd
npm test
```
---
