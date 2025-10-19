const express = require('express');
const cors = require('cors');
require('dotenv').config();
const path = require('path');
const app = express();

const allowOrigin = (origin) => {
  if (!origin) return true; // non-browser
  try {
    const url = new URL(origin);
    const h = url.hostname;
    return (
      origin === 'https://gabydv.xyz' ||
      origin === 'https://www.gabydv.xyz' ||
      h === 'localhost' ||
      h.endsWith('.vercel.app')
    );
  } catch {
    return false;
  }
};

app.use(cors({
  origin: (origin, cb) => (allowOrigin(origin) ? cb(null, true) : cb(new Error('Not allowed by CORS'))),
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
  credentials: false // set true only if you actually use cookies/auth headers across origins
}));

app.options('*', cors()); // preflight

// Use regex to avoid path-to-regexp '*' error
app.options(/.*/, cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

app.get('/api/health', (req, res) => res.send('ok'));

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

// Debug: list registered routes
app.get('/api/_routes', (req, res) => {
  const routes = [];
  app._router.stack.forEach(m => {
    if (m.route && m.route.path) {
      routes.push({ method: Object.keys(m.route.methods)[0].toUpperCase(), path: m.route.path });
    } else if (m.name === 'router' && m.handle.stack) {
      m.handle.stack.forEach(s => {
        if (s.route) {
          const method = Object.keys(s.route.methods)[0]?.toUpperCase();
          routes.push({ method, path: (m.regexp?.toString() || '') + s.route.path });
        }
      });
    }
  });
  res.json(routes);
});

app.get('/uploads/progressnotes/:filename', (req, res) => {
  const filePath = path.join(__dirname, 'uploads/progressnotes', req.params.filename);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'inline');
  res.sendFile(filePath);
});

module.exports = app;