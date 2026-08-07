// NOTE: literal sub-paths (/todos/stats, /todos/sorted, /todos/reorder) must
// be registered before /todos/:id below, or Express matches them against
// :id first (e.g. id = "stats") and they become unreachable.

// BUG: no existence check -> TypeError when id doesn't match any todo
app.get('/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const todo = todos.find(t => t.id === id);
  
  if (!todo) {
    return res.status(404).json({ error: 'Todo not found' });
  }
  
  res.json({ title: todo.title, details: todo });
});

// BUG: assumes req.body.title is always a string -> TypeError on missing/non-string title
app.post('/todos', (req, res) => {
