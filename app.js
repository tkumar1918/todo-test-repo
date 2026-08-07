// Fixed: Look up todo by ID and check for existence before modifying
app.put('/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const todo = todos.find(t => t.id === id);

  if (!todo) {
    return res.status(404).json({ error: 'Todo not found' });
  }

  // Update fields if provided in the request body
  if (req.body.title !== undefined) todo.title = req.body.title;
  if (req.body.description !== undefined) todo.description = req.body.description;
  if (req.body.priority !== undefined) todo.priority = req.body.priority;

  res.json(todo);
});