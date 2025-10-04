const express = require('express');
const cors = require('cors');
require('dotenv').config();
const path = require('path');
const app = express();

app.use(cors({
  origin: 'http://localhost:3000'
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);

const lessonRoutes = require('./routes/lessonRoutes');
app.use('/api/lessons', lessonRoutes);

const studentRoutes = require('./routes/studentRoutes');
app.use('/api/students', studentRoutes);

const lessonReportRoutes = require('./routes/lessonReportRoutes');
app.use('/api/lessonReports', lessonReportRoutes);

const progressNotesRoutes = require('./routes/progressNotesRoutes');
app.use('/api/progressnotes', progressNotesRoutes);

const subjectRoutes = require('./routes/subjectRoutes');
app.use('/api/subjects', subjectRoutes);

const studentRequestsRoutes = require('./routes/studentRequestsRoutes');
app.use('/api/studentRequests', studentRequestsRoutes);

const newSubjectRequestsRoutes = require('./routes/newSubjectRequestsRoutes');
app.use('/api/newSubjectRequests', newSubjectRequestsRoutes);


app.get('/uploads/progressnotes/:filename', (req, res) => {
    console.log('Serving PDF inline:', req.params.filename);
    const filePath = path.join(__dirname, 'uploads/progressnotes', req.params.filename);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline');
    res.sendFile(filePath);
});

// Example Express handler
app.post('/api/users/change-status', async (req, res) => {
    const { userID, newStatus, adminPassword } = req.body;
    // Replace 'yourAdminPassword' with your actual admin password logic
    if (adminPassword !== process.env.ADMIN_PASSWORD) {
        return res.json({ success: false, message: "Incorrect admin password." });
    }
    await pool.query("UPDATE Users SET status = ? WHERE userID = ?", [newStatus, userID]);
    res.json({ success: true });
});


const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});