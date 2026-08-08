app.get('/todos/sorted', (req, res) => {
  const sorted = [...todos].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  res.json(sorted);
});