const express = require('express');
const app = express();
const cors = require('cors');
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first'); // prefer IPv4 to avoid IPv6 ETIMEDOUT

// Allow specific origins via env or allow all if not set
const allowed = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

const corsOptions = {
  origin: (origin, cb) => {
    if (!origin) return cb(null, true); // non-browser or same-origin
    if (allowed.length === 0) return cb(null, true); // allow all if not configured
    return allowed.includes(origin) ? cb(null, true) : cb(new Error('Not allowed by CORS'));
  },
  methods: ['GET','HEAD','PUT','PATCH','POST','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization','Accept'],
  exposedHeaders: ['Content-Range','X-Total-Count'],
  credentials: false,
  optionsSuccessStatus: 204,
};

// Preflight handler without path pattern (Express 5 safe)
const corsMW = cors(corsOptions);
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    return corsMW(req, res, () => res.sendStatus(204));
  }
  next();
});

// CORS for all other requests
app.use(corsMW);

// Optional health check
app.get('/api/health', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 5000;
console.log('Booting server.js', { cwd: process.cwd(), PORT });
app.listen(PORT, () => console.log(`API listening on ${PORT}`));