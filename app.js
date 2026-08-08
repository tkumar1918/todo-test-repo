// ... inside app.post('/todos', ...)
const todo = {
  id: nextId++,
  title,
  description: req.body.description || null,
  completed: false,
  priority: req.body.priority || 'medium',
  dueDate: req.body.dueDate ? new Date(req.body.dueDate) : null, // Convert string to Date object here
  createdAt: new Date().toISOString()
};