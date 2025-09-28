const pool = require('../config/db');

exports.getAllStudents = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT s.*, u.name, u.image
            FROM Students s
            LEFT JOIN Users u ON s.userID = u.userID
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch students" });
    }
};

exports.getStudentByUserID = async (req, res) => {
    const { userID } = req.params;
    try {
        const [rows] = await pool.query(
            `SELECT s.*, u.name, u.image
             FROM Students s
             LEFT JOIN Users u ON s.userID = u.userID
             WHERE s.userID = ?`,
            [userID]
        );
        if (rows.length > 0) {
            res.json(rows[0]);
        } else {
            res.status(404).json({ error: "Student not found" });
        }
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch student" });
    }
};