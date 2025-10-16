

// Get all tutors
exports.getAllTutors = async (req, res) => {
    const pool = require('../config/db');
    try {
        const [rows] = await pool.query(`
            SELECT 
                t.*,
                u.name,
                u.image,
                ROUND(IFNULL(AVG(r.rating), 0), 1) AS rating,
                COUNT(r.ratingID) AS num_ratings
            FROM Tutors t
            JOIN Users u ON t.userID = u.userID
            LEFT JOIN Rating r ON t.tutorID = r.tutorID
            GROUP BY t.tutorID
        `);
        res.json(rows);
    } catch (err) {
        console.error("Failed to fetch tutors:", err);
        res.status(500).json({ error: "Failed to fetch tutors" });
    }
};

// Get single tutor by ID
exports.getTutorById = async (req, res) => {
    const pool = require('../config/db');
    try {
        const tutorID = req.params.id;
        const [rows] = await pool.query(
            "SELECT t.*, u.name, u.image, u.bio, u.subjects, u.qualifications, u.availability " +
            "FROM Tutors t JOIN Users u ON t.userID = u.userID WHERE t.tutorID = ?",
            [tutorID]
        );
        if (rows.length === 0) return res.status(404).json({ error: "Tutor not found" });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch tutor" });
    }
};

// Create a new tutor
exports.createTutor = async (req, res) => {
    const pool = require('../config/db');
    try {
        const { userID, fee_per_hour, experience, bio, subjects, qualifications, availability } = req.body;
        await pool.query(
            "INSERT INTO Tutors (userID, fee_per_hour, experience, bio, subjects, qualifications, availability) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [userID, fee_per_hour, experience, bio, subjects, qualifications, availability]
        );
        res.status(201).json({ message: "Tutor created!" });
    } catch (err) {
        res.status(500).json({ error: "Failed to create tutor" });
    }
};

// Update tutor
exports.updateTutor = async (req, res) => {
    const pool = require('../config/db');
    try {
        const tutorID = req.params.id;
        const { fee_per_hour, experience, bio, subjects, qualifications, availability } = req.body;
        await pool.query(
            "UPDATE Tutors SET fee_per_hour = ?, experience = ?, bio = ?, subjects = ?, qualifications = ?, availability = ? WHERE tutorID = ?",
            [fee_per_hour, experience, bio, subjects, qualifications, availability, tutorID]
        );
        res.json({ message: "Tutor updated!" });
    } catch (err) {
        res.status(500).json({ error: "Failed to update tutor" });
    }
};

// Delete tutor
exports.deleteTutor = async (req, res) => {
    const pool = require('../config/db');
    try {
        const tutorID = req.params.id;
        await pool.query("DELETE FROM tutors WHERE tutorID = ?", [tutorID]);
        res.json({ message: "Tutor deleted!" });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete tutor" });
    }
};