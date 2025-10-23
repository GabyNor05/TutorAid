require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// CORS config
const allowed = new Set([
  process.env.FRONTEND_URL,                 // e.g. https://your-site.vercel.app
  'http://localhost:3000',
  'http://localhost:5173',
  'https://gabydv.xyz',
].filter(Boolean));

const corsOptions = {
  origin(origin, cb) {
    // Allow same-origin or non-browser (e.g., curl)
    if (!origin) return cb(null, true);
    if (allowed.has(origin)) return cb(null, true);
    // Allow any vercel preview/prod for this app
    if (/\.vercel\.app$/.test(origin)) return cb(null, true);
    return cb(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true, // allow cookies if you ever need them
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
  maxAge: 86400,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // preflight

app.use(express.json());
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

// Static PDFs
app.get('/uploads/progressnotes/:filename', (req, res) => {
  const filePath = path.join(__dirname, 'uploads/progressnotes', req.params.filename);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'inline');
  res.sendFile(filePath);
});

module.exports = app;