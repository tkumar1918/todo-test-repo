app.post('/todos/related', (req, res) => {
  // Check if filters and priority exist before accessing them
  const samePriority = req.body?.filters?.priority;

  if (!samePriority) {
    return res.status(400).json({ error: 'Filters or priority parameter is missing.' });
  }

  const matches = todos.filter(t => t.priority === samePriority);
  res.json(matches);
});