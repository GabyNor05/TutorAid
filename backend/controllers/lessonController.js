const pool = require('../config/db');

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