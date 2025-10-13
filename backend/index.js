const express = require('express');
const cors = require('cors'); // Keep the require statement
require('dotenv').config();

const app = express();

// Use the cors middleware with default settings. 
// vercel.json will handle the specific origin policies.
app.use(cors()); 

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