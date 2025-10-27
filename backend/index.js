require('dotenv').config();

const express = require('express');
const cors = require('cors');
const dns = require('dns');

dns.setDefaultResultOrder('ipv4first'); // prefer IPv4 to avoid IPv6 ETIMEDOUT

const app = express();

// CORS config
const allowAll = String(process.env.ALLOW_ALL_CORS || '').toLowerCase() === 'true';
const allowed = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

const corsOptions = {
  origin(origin, cb) {
    if (allowAll) return cb(null, true);
    if (!origin) return cb(null, true); // same-origin or non-browser
    if (allowed.length === 0) return cb(null, true); // allow all if not configured
    return allowed.includes(origin) ? cb(null, true) : cb(new Error(`Not allowed by CORS: ${origin}`));
  },
  methods: ['GET','HEAD','PUT','PATCH','POST','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization','Accept'],
  exposedHeaders: [],
  credentials: false,
  optionsSuccessStatus: 204,
};

// Express 5-safe preflight and headers
app.use((req, res, next) => {
  const origin = req.headers.origin || '*';
  if (allowAll || (allowed.length > 0 && allowed.includes(origin))) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Vary', 'Origin');
  }
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,Accept');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});
app.use(cors(corsOptions));

// Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
try { app.use('/api/users', require('./routes/userRoutes')); } catch {}
try { app.use('/api/tutors', require('./routes/tutorRoutes')); } catch {}
try { app.use('/api/lessons', require('./routes/lessonRoutes')); } catch {}
try { app.use('/api/newsletter', require('./routes/newsletterRoutes')); } catch {}
try { app.use('/api/students', require('./routes/studentRoutes')); } catch {}
try { app.use('/api/subjects', require('./routes/subjectsRoutes')); } catch {}

// Health
app.get('/api/health', (req, res) => res.json({ ok: true }));

// 404
app.use((req, res) => res.status(404).json({ error: 'Not found' }));

module.exports = app;