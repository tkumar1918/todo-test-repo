const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Crash endpoint - triggers a genuine runtime exception (BigInt division by
// zero throws a real RangeError from the JS engine itself, unlike regular
// number division which just yields Infinity/NaN). Thrown synchronously in
// the handler so Express 5's built-in error handling catches it and routes
// it to the error middleware below - the request fails, but the server
// process itself keeps running.
app.get('/crash', (req, res) => {
  console.log('GET /crash called');
  const numerator = 10n;
  const divisor = 0n;
  numerator / divisor; // RangeError: Division by zero
});

// Divide endpoint - controlled division error
app.get('/divide', (req, res, next) => {
  const num = parseInt(req.query.num) || 10;
  const denom = parseInt(req.query.denom) || 0;

  if (denom === 0) {
    return next(new Error('Not divisible by zero'));
  }

  res.json({ result: num / denom });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log('\nAvailable endpoints:');
  console.log(`  GET http://localhost:${PORT}/ - Health check`);
  console.log(`  GET http://localhost:${PORT}/crash - Throws division by zero error`);
  console.log(`  GET http://localhost:${PORT}/divide?num=20&denom=0 - Throws if denom is 0\n`);
});