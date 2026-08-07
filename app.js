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

// FIX: Check if todo exists before accessing properties
app.get('/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const todo = todos.find(t => t.id === id);

  if (!todo) {
    return res.status(404).json({ error: 'Todo item not found' });
  }

  res.json({ title: todo.title, details: todo });
});

// BUG: assumes req.body.title is always a string -> TypeError on missing/non-string title
app.post('/todos', (req, res) => {