// BUG: dueDate is stored as a string, not a Date -> TypeError, getTime is not a function
app.get('/todos/sorted', (req, res) => {
  const sorted = [...todos].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  res.json(sorted);
});