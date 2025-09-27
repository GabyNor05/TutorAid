const pool = require('../config/db');
const nodemailer = require('nodemailer'); // For sending emails

exports.createLesson = async (req, res) => {
    const { tutorID, studentID, date, startTime, duration, subject } = req.body;
    try {
        await pool.query(
            `INSERT INTO Lessons (tutorID, studentID, subject, date, startTime, duration)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [tutorID, studentID, subject, date, startTime, duration]
        );
        res.json({ message: "Lesson booked!" });
    } catch (err) {
        console.error("Error booking lesson:", err);
        res.status(500).json({ error: "Failed to book lesson" });
    }
};

// Example controller for GET /api/lessons
exports.getLessonsForTutor = async (req, res) => {
    const tutorID = req.query.tutorID;
    try {
        const [rows] = await pool.query(
            `SELECT l.lessonID, l.status, u.name AS studentName, u.image AS studentImage, l.date, l.startTime, l.endTime, l.subject, s.address
             FROM Lessons l
             LEFT JOIN Students s ON l.studentID = s.studentID
             LEFT JOIN Users u ON s.userID = u.userID
             WHERE l.tutorID = ?`,
            [tutorID]
        );
        console.log("Lessons fetched:", rows);
        res.json(rows);
    } catch (err) {
        console.error("Error fetching lessons:", err);
        res.status(500).json({ error: "Failed to fetch lessons" });
    }
};

exports.updateLessonStatus = async (req, res) => {
    const { lessonID, status } = req.body;
    try {
        await pool.query(
            `UPDATE Lessons SET status = ? WHERE lessonID = ?`,
            [status, lessonID]
        );
        res.json({ message: "Lesson status updated!" });
    } catch (err) {
        res.status(500).json({ error: "Failed to update lesson status" });
    }
};

exports.deleteLesson = async (req, res) => {
    const { lessonID, studentEmail } = req.body;
    try {
        await pool.query(`DELETE FROM Lessons WHERE lessonID = ?`, [lessonID]);
        // Send cancellation email
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: studentEmail,
            subject: "Lesson Cancelled",
            text: "Your lesson has been cancelled by the tutor."
        });
        res.json({ message: "Lesson deleted and email sent!" });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete lesson" });
    }
};

exports.getAcceptedLessons = async (req, res) => {
    const { userID, role } = req.query;
    let whereClause = "";
    if (role === "Tutor") {
        whereClause = "l.tutorID = ?";
    } else if (role === "Student") {
        whereClause = "s.userID = ?"; // Match by userID in Students table
    } else {
        return res.json([]);
    }
    try {
        const [rows] = await pool.query(
            `SELECT l.lessonID, u.name AS studentName, u.image AS studentImage, l.date, l.startTime, l.endTime, l.subject, s.address as studentAddress
             FROM Lessons l
             LEFT JOIN Students s ON l.studentID = s.studentID
             LEFT JOIN Users u ON s.userID = u.userID
             WHERE ${whereClause} AND l.status = 'accepted'`,
            [userID]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch lessons" });
    }
};