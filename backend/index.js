require('dotenv').config();

const express = require('express');
const dns = require('dns');
const path = require('path');

dns.setDefaultResultOrder('ipv4first');

const app = express();

// CORS: localhost + env ALLOWED_ORIGINS (comma/space separated; supports * wildcards)
const DEFAULT_ALLOWED = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://192.168.1.54:3000',
];

function parseAllowed() {
  const fromEnv =
    (process.env.ALLOWED_ORIGINS || process.env.Allowed_ORIGINs || '')
      .split(/[,\s]+/)
      .map(s => s.trim())
      .filter(Boolean);
  const all = [...DEFAULT_ALLOWED, ...fromEnv];
  // de-dup while preserving order
  return all.filter((v, i) => all.indexOf(v) === i);
}

function matchOrigin(origin, pattern) {
  if (!pattern) return false;
  if (pattern === '*') return true;
  const esc = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
  return new RegExp(`^${esc}$`, 'i').test(origin);
}

function originAllowed(origin, list) {
  if (!origin) return true; // same-origin/non-CORS
  return list.some(p => matchOrigin(origin, p));
}

app.use((req, res, next) => {
  const origin = req.headers.origin || '';
  const allowed = parseAllowed();
  const ok = originAllowed(origin, allowed);

  if (ok) {
    // Echo exact origin when CORS is allowed
    if (origin) res.setHeader('Access-Control-Allow-Origin', origin);
    else res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    req.headers['access-control-request-headers'] || 'Content-Type, Authorization'
  );
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);

const tutorRoutes = require('./routes/tutorRoutes');
app.use('/api/tutors', tutorRoutes);

const lessonRoutes = require('./routes/lessonRoutes');
app.use('/api/lessons', lessonRoutes);

const studentRoutes = require('./routes/studentRoutes');
app.use('/api/students', studentRoutes);

const lessonReportRoutes = require('./routes/lessonReportRoutes');
app.use('/api/lessonReports', lessonReportRoutes);

const progressNotesRoutes = require('./routes/progressNotesRoutes');
app.use('/api/progress-notes', progressNotesRoutes); 

app.use('/api/progressNotes', progressNotesRoutes);

const subjectRoutes = require('./routes/subjectRoutes');
app.use('/api/subjects', subjectRoutes);

const studentRequestsRoutes = require('./routes/studentRequestsRoutes');
app.use('/api/studentRequests', studentRequestsRoutes);

const newSubjectRequestsRoutes = require('./routes/newSubjectRequestsRoutes');
app.use('/api/newSubjectRequests', newSubjectRequestsRoutes);

const ratingRoutes = require('./routes/ratingRoutes');
app.use('/api/ratings', ratingRoutes);

const messagesRoutes = require('./routes/messagesRoutes');
app.use('/api/messages', messagesRoutes);

// Health/debug
app.get('/api/health', (req, res) => {
  const origin = req.headers.origin || null;
  const allowedList = parseAllowed();
  const ok = originAllowed(origin || '', allowedList);
  res.json({ ok: true, origin, cors: { allowed: ok, allowedList } });
});

app.get('/api/db-health', async (req, res) => {
  try {
    const pool = require('./config/db');
    const [rows] = await pool.query('SELECT 1 AS ok');
    res.json({ ok: true, rows });
  } catch (e) {
    console.error('DB health error:', e);
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.get('/api/db-inspect', async (req, res) => {
  try {
    const pool = require('./config/db');
    const [[{ db }]] = await pool.query('SELECT DATABASE() AS db');
    const [tables] = await pool.query('SHOW TABLES');
    res.json({ db, tables });
  } catch (e) {
    console.error('DB inspect error:', e);
    res.status(500).json({ error: e.message, code: e.code, sqlMessage: e.sqlMessage });
  }
});

// Static PDFs
app.get('/uploads/progressnotes/:filename', (req, res) => {
  const filePath = path.join(__dirname, 'uploads/progressnotes', req.params.filename);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'inline');
  res.sendFile(filePath);
});

const newsletterRoutes = require('./routes/newsletterRoutes');
app.use('/api/newsletter', newsletterRoutes);

const feedbackRoutes = require('./routes/feedbackRoutes');
app.use('/api/feedback', feedbackRoutes);

module.exports = app;