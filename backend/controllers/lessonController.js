const nodemailer = require('nodemailer'); // For sending emails

exports.createLesson = async (req, res) => {
    const pool = require('../config/db');
    const { tutorID, studentID, date, startTime, duration, subject } = req.body;
    try {
        await pool.query(
            `INSERT INTO lessons (tutorID, studentID, subject, date, startTime, duration)
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
    const pool = require('../config/db');
    const tutorID = req.query.tutorID;
    try {
        const [rows] = await pool.query(
            `SELECT l.lessonID, l.status, u.name AS studentName, u.image AS studentImage, l.date, l.startTime, l.endTime, l.subject, s.address
             FROM lessons l
             LEFT JOIN students s ON l.studentID = s.studentID
             LEFT JOIN users u ON s.userID = u.userID
             WHERE l.tutorID = ?`,
            [tutorID]
        );
        console.log("lessons fetched:", rows);
        res.json(rows);
    } catch (err) {
        console.error("Error fetching lessons:", err);
        res.status(500).json({ error: "Failed to fetch lessons" });
    }
};

exports.updateLessonStatus = async (req, res) => {
    const pool = require('../config/db');
    const { lessonID, status } = req.body;
    try {
        await pool.query(
            `UPDATE lessons SET status = ? WHERE lessonID = ?`,
            [status, lessonID]
        );
        res.json({ message: "Lesson status updated!" });
    } catch (err) {
        res.status(500).json({ error: "Failed to update lesson status" });
    }
};

exports.deleteLesson = async (req, res) => {
    const pool = require('../config/db');
    const { lessonID, studentEmail } = req.body;
    try {
        await pool.query(`DELETE FROM lessons WHERE lessonID = ?`, [lessonID]);
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
    const pool = require('../config/db');
    const { userID, role } = req.query;

    let query = "";
    let params = [];

    if (role === "Student") {
        const [studentRows] = await pool.query(
            "SELECT studentID FROM students WHERE userID = ?",
            [userID]
        );
        if (studentRows.length === 0) {
            return res.json([]);
        }
        const studentID = studentRows[0].studentID;

        query = `
            SELECT l.*, u.name AS tutorName, u.image AS tutorImage
            FROM lessons l
            JOIN Tutors t ON l.tutorID = t.tutorID
            JOIN students s ON l.studentID = s.studentID
            JOIN users u ON t.userID = u.userID
            WHERE l.studentID = ?
            AND l.status = 'accepted'
            ORDER BY l.date ASC
        `;
        params = [studentID];
    } else if (role === "Tutor") {
        // Get lessons for this tutor, join users for student info
        query = `
            SELECT l.*, u.name AS studentName, u.image AS studentImage
            FROM lessons l
            JOIN students s ON l.studentID = s.studentID
            JOIN users u ON s.userID = u.userID
            WHERE l.tutorID = ?
            AND l.status = 'accepted'
            ORDER BY l.date ASC
        `;
        params = [userID];
    } else {
        // For admin or other roles, return empty or handle as needed
        return res.json([]);
    }

    try {
        
        const [rows] = await pool.query(query, params);
        
        res.json(rows);
    } catch (err) {
        console.error("Failed to fetch accepted lessons:", err);
        res.status(500).json({ error: "Failed to fetch accepted lessons" });
    }
};