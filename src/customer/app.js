const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send(`Customer Service - Version: 1.0.0 - Environment: ${process.env.NODE_ENV || 'development'}`);
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`Customer service listening on port ${port}`);
});
