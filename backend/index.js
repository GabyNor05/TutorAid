require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// CORS (allow your domains + Vercel previews)
const allowOrigin = (origin) => {
  if (!origin) return true; // non-browser
  try {
    const h = new URL(origin).hostname;
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
  credentials: false,
}));

// Express 5: avoid '*' here
app.options(/.*/, cors());

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