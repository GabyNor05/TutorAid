const pool = require('../config/db');

exports.createLessonReport = async (req, res) => {
    const { studentID, subject, reportDate, comments } = req.body;
    try {
        await pool.query(
            "INSERT INTO LessonReports (studentID, subject, reportDate, comments) VALUES (?, ?, ?, ?)",
            [studentID, subject, reportDate, comments]
        );
        res.status(201).json({ message: "Report created" });
    } catch (err) {
        res.status(500).json({ error: "Failed to create report" });
    }
};