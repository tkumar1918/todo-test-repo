// BUG: assumes req.body.title is always a string -> TypeError on missing/non-string title
app.post('/todos', (req, res) => {
  // FIX: Check if title exists before trying to trim it
  if (!req.body.title || typeof req.body.title !== 'string') {
    return res.status(400).json({ error: 'Title is required and must be a string.' });
  }

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