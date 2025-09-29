import express from 'express';

const app = express();

app.get('/health', (req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

app.listen(5000, '0.0.0.0', () => {
  console.log('Test server running on port 5000');
});