const express = require('express');
const app = express();
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first'); // prefer IPv4 to avoid IPv6 ETIMEDOUT

const PORT = process.env.PORT || 5000;
console.log('Booting server.js', { cwd: process.cwd(), PORT });

// Middleware
app.use(express.json());

// Simple request logger with response time
app.use((req, res, next) => {
  const start = Date.now();
  const { method, originalUrl, query, body } = req;
  console.log(`[REQ] ${method} ${originalUrl} q=${JSON.stringify(query)} b=${JSON.stringify(body)}`);
  res.on('finish', () => {
    console.log(`[RES] ${method} ${originalUrl} -> ${res.statusCode} (${Date.now() - start}ms)`);
  });
  next();
});

// Route mounts
// const lessonRoutes = require('./routes/lessonRoutes');
// app.use('/api/lessons', lessonRoutes);

app.listen(PORT, () => console.log(`API listening on ${PORT}`));