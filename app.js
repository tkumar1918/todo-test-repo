app.delete('/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const todo = todos.find(t => t.id === id);

  // FIX: Check if the todo was found before proceeding
  if (!todo) {
    return res.status(404).json({ error: 'Todo not found' });
  }

  // If found, proceed with deletion
  const index = todos.indexOf(todo);
  todos.splice(index, 1);
  res.json({ deleted: todo.id, title: todo.title });
});