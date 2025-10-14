const express = require('express');
const cors = require('cors');
require('dotenv').config();
const path = require('path');
const app = express();

const allowedOrigins = [
  'http://localhost:3000',
  process.env.FRONTEND_URL,        // https://gabydv.dpdns.org
  'https://www.gabydv.dpdns.org',
].filter(Boolean);

const corsOptions = {
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    try {
      const host = new URL(origin).host;
      const isAllowed = allowedOrigins.includes(origin) ||
                        (/\.vercel\.app$/.test(host) && process.env.ALLOW_VERCEL_WILDCARD === 'true');
      return isAllowed ? cb(null, true) : cb(new Error('CORS blocked'), false);
    } catch {
      return cb(new Error('CORS blocked'), false);
    }
  }
};

app.use(cors(corsOptions));
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

app.get('/uploads/progressnotes/:filename', (req, res) => {
  const filePath = path.join(__dirname, 'uploads/progressnotes', req.params.filename);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'inline');
  res.sendFile(filePath);
});

module.exports = app;