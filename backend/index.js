require('dotenv').config();

const express = require('express');
const dns = require('dns');
const path = require('path');

dns.setDefaultResultOrder('ipv4first');

const app = express();

// CORS allowlist (env)
const allowAll = String(process.env.ALLOW_ALL_CORS || '').toLowerCase() === 'true';
const allowed = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

// Force CORS headers + handle OPTIONS (Express 5 safe)
app.use((req, res, next) => {
  const origin = req.headers.origin || '';
  const reqHeaders = req.headers['access-control-request-headers'];

  // Always answer preflight with CORS headers
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Headers', reqHeaders || 'Content-Type,Authorization,Accept');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.setHeader('Access-Control-Max-Age', '86400');
    return res.status(204).end();
  }

  // For actual requests, apply allowlist if configured
  const isAllowed =
    allowAll ||
    !allowed.length ||
    (origin && (allowed.includes(origin) || /\.vercel\.app$/.test(origin)));

  if (isAllowed) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
    res.setHeader('Vary', 'Origin');
  }
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
app.use('/api/progressNotes', progressNotesRoutes);
app.use('/api/progressnotes', progressNotesRoutes); // lowercase alias

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
app.get('/api/health', (req, res) => res.json({ ok: true, origin: req.headers.origin || null }));

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

module.exports = app;