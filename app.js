const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// ---- In-memory store ----
let todos = [
  { id: 1, title: 'Learn Express', description: 'Read the docs', completed: false, priority: 'medium', dueDate: '2026-08-10', createdAt: new Date().toISOString() },
  { id: 2, title: 'Build Todo API', description: 'CRUD endpoints', completed: false, priority: 'high', dueDate: '2026-08-15', createdAt: new Date().toISOString() },
  { id: 3, title: 'Write tests', description: null, completed: true, priority: 'low', dueDate: '2026-08-01', createdAt: new Date().toISOString() }
];
let nextId = 4;

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Todo API is running' });
});

// List todos, optionally filtered by ?completed= or ?priority=
app.get('/todos', (req, res) => {
  let result = todos;

  if (req.query.completed !== undefined) {
    result = result.filter(t => t.completed == req.query.completed);
  }

  if (req.query.priority) {
    result = result.filter(t => t.priority === req.query.priority);
  }

  res.json(result);
});

// NOTE: literal sub-paths (/todos/stats, /todos/sorted, /todos/reorder) must
// be registered before /todos/:id below, or Express matches them against
// :id first (e.g. id = "stats") and they become unreachable.

// BUG: real engine RangeError (BigInt division by zero) when todos is empty
app.get('/todos/stats', (req, res) => {
  const total = BigInt(todos.length);
  const completed = BigInt(todos.filter(t => t.completed).length);
  const percent = (completed * 100n) / total;
  res.json({ total: Number(total), completed: Number(completed), percentComplete: Number(percent) });
});

// BUG: dueDate is stored as a string, not a Date -> TypeError, getTime is not a function
app.get('/todos/sorted', (req, res) => {
  const sorted = [...todos].sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
  res.json(sorted);
});

// BUG: no existence check -> TypeError when id doesn't match any todo
app.get('/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const todo = todos.find(t => t.id === id);
  res.json({ title: todo.title, details: todo });
});

// BUG: assumes req.body.title is always a string -> TypeError on missing/non-string title
app.post('/todos', (req, res) => {
  const title = req.body.title.trim();
  const todo = {
    id: nextId++,
    title,
    description: req.body.description || null,
    completed: false,
    priority: req.body.priority || 'medium',
    dueDate: req.body.dueDate || null,
    createdAt: new Date().toISOString()
  };
  todos.push(todo);
  res.status(201).json(todo);
});

// BUG: `to` is used as an array index with no bounds check -> TypeError
app.put('/todos/reorder', (req, res) => {
  const { from, to } = req.body;
  [todos[from], todos[to]] = [todos[to], todos[from]];
  res.json({ moved: todos[to].title });
});

// BUG: treats :id as an array index instead of looking it up -> TypeError
// once the id exceeds the current array bounds
app.put('/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const todo = todos[id];
  todo.title = req.body.title ?? todo.title;
  todo.description = req.body.description ?? todo.description;
  todo.priority = req.body.priority ?? todo.priority;
  res.json(todo);
});

// BUG: no existence check -> TypeError when id doesn't match any todo
app.patch('/todos/:id/toggle', (req, res) => {
  const id = parseInt(req.params.id);
  const todo = todos.find(t => t.id === id);
  todo.completed = !todo.completed;
  res.json(todo);
});

// BUG: reads properties off `todo` before confirming it was found -> TypeError
app.delete('/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const todo = todos.find(t => t.id === id);
  todos.splice(todos.indexOf(todo), 1);
  res.json({ deleted: todo.id, title: todo.title });
});

// BUG: recursive duplication has no base case -> RangeError, Maximum call stack size exceeded
function duplicateTodo(todo) {
  todos.push(todo);
  return duplicateTodo({ ...todo, id: nextId++ });
}

app.post('/todos/:id/duplicate', (req, res) => {
  const id = parseInt(req.params.id);
  const todo = todos.find(t => t.id === id);
  const clone = duplicateTodo({ ...todo, id: nextId++ });
  res.status(201).json(clone);
});

// BUG: assumes req.body.filters is always present -> TypeError on missing filters
app.post('/todos/related', (req, res) => {
  const samePriority = req.body.filters.priority;
  const matches = todos.filter(t => t.priority === samePriority);
  res.json(matches);
});

// BUG: unguarded JSON.parse -> SyntaxError on malformed input
app.post('/todos/import', (req, res) => {
  const imported = JSON.parse(req.body.raw);
  imported.forEach(t => todos.push({ ...t, id: nextId++ }));
  res.status(201).json({ imported: imported.length });
});

// Crash endpoint - genuine engine RangeError (BigInt division by zero),
// caught by Express's built-in error handling below without killing the process
app.get('/crash', (req, res) => {
  const numerator = 10n;
  const divisor = 0n;
  numerator / divisor;
});

// Divide endpoint - controlled division error
app.get('/divide', (req, res, next) => {
  const num = parseInt(req.query.num) || 10;
  const denom = parseInt(req.query.denom) || 0;

  if (denom === 0) {
    return next(new Error('Not divisible by zero'));
  }

  res.json({ result: num / denom });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log('\nAvailable endpoints:');
  console.log(`  GET    /                       - Health check`);
  console.log(`  GET    /todos                  - List todos (?completed=, ?priority=)`);
  console.log(`  GET    /todos/:id               - Get one todo (crashes if not found)`);
  console.log(`  POST   /todos                  - Create a todo (crashes if title missing)`);
  console.log(`  PUT    /todos/:id               - Update a todo (crashes on out-of-range id)`);
  console.log(`  PATCH  /todos/:id/toggle         - Toggle completed (crashes if not found)`);
  console.log(`  DELETE /todos/:id               - Delete a todo (crashes if not found)`);
  console.log(`  GET    /todos/stats             - Stats (crashes when list is empty)`);
  console.log(`  GET    /todos/sorted            - Sort by due date (always crashes)`);
  console.log(`  POST   /todos/:id/duplicate      - Duplicate a todo (always crashes: stack overflow)`);
  console.log(`  PUT    /todos/reorder           - Reorder (crashes on invalid indices)`);
  console.log(`  POST   /todos/related           - Related todos (crashes if filters missing)`);
  console.log(`  POST   /todos/import            - Import raw JSON (crashes on invalid JSON)`);
  console.log(`  GET    /crash                   - Always crashes (BigInt division by zero)`);
  console.log(`  GET    /divide?num=&denom=      - Crashes if denom=0\n`);
});
