  // BUG: treats :id as an array index instead of looking it up -> TypeError
  // once the id exceeds the current array bounds
app.put('/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const todo = todos.find(t => t.id === id);
  if (!todo) {
    return res.status(404).json({ error: 'Todo not found' });
  }
  todo.title = req.body.title ?? todo.title;
  todo.description = req.body.description ?? todo.description;
  todo.priority = req.body.priority ?? todo.priority;
  res.json(todo);
});