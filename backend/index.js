const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// --- START: Temporary Debugging Middleware ---
// This will run for EVERY request and log information to your Vercel logs.
app.use((req, res, next) => {
  console.log('--- INCOMING REQUEST ---');
  console.log('Request Origin:', req.headers.origin);
  console.log('Request Path:', req.path);
  console.log('FRONTEND_URL from env:', process.env.FRONTEND_URL);
  console.log('------------------------');
  next(); // Pass the request to the next middleware
});
// --- END: Temporary Debugging Middleware ---


// --- START: CORS Configuration ---
const allowedOrigins = [
  'http://localhost:3000',
  process.env.FRONTEND_URL
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.error('CORS ERROR: Origin not allowed:', origin); // Log CORS errors
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
// --- END: CORS Configuration ---


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Routes ---
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


module.exports = app;