
// Get all tutors
exports.getAllTutors = async (req, res) => {
    const pool = require('../config/db'); // <-- Moved inside
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
    const pool = require('../config/db'); // <-- Moved inside
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
        console.error('Error fetching tutor by ID:', err);
        res.status(500).json({ error: 'Failed to fetch tutor' });
    }
};

// Create a new tutor
exports.createTutor = async (req, res) => {
    const pool = require('../config/db'); // <-- Moved inside
    try {
        const { userID, bio, subjects, qualifications, availability } = req.body;
        const [result] = await pool.query(
            'INSERT INTO Tutors (userID, bio, subjects, qualifications, availability) VALUES (?, ?, ?, ?, ?)',
            [userID, bio, subjects, qualifications, availability]
        );
        res.status(201).json({ tutorID: result.insertId, ...req.body });
    } catch (err) {
        console.error('Error creating tutor:', err);
        res.status(500).json({ error: 'Failed to create tutor' });
    }
};

// Update tutor
exports.updateTutor = async (req, res) => {
    const pool = require('../config/db'); // <-- Moved inside
    try {
        const tutorID = req.params.id;
        const { bio, subjects, qualifications, availability } = req.body;
        const [result] = await pool.query(
            'UPDATE Tutors SET bio = ?, subjects = ?, qualifications = ?, availability = ? WHERE tutorID = ?',
            [bio, subjects, qualifications, availability, tutorID]
        );
        if (result.affectedRows > 0) {
            res.json({ message: 'Tutor updated successfully' });
        } else {
            res.status(404).json({ error: 'Tutor not found' });
        }
    } catch (err) {
        console.error('Error updating tutor:', err);
        res.status(500).json({ error: 'Failed to update tutor' });
    }
};

// Delete tutor
exports.deleteTutor = async (req, res) => {
    const pool = require('../config/db'); // <-- Moved inside
    try {
        const tutorID = req.params.id;
        const [result] = await pool.query('DELETE FROM Tutors WHERE tutorID = ?', [tutorID]);
        if (result.affectedRows > 0) {
            res.json({ message: 'Tutor deleted successfully' });
        } else {
            res.status(404).json({ error: 'Tutor not found' });
        }
    } catch (err) {
        console.error('Error deleting tutor:', err);
        res.status(500).json({ error: 'Failed to delete tutor' });
    }
};

exports.getTutorByUserID = async (req, res) => {
    const pool = require('../config/db'); // <-- Moved inside
    try {
        const { userID } = req.params;
        const [rows] = await pool.query('SELECT * FROM Tutors WHERE userID = ?', [userID]);
        if (rows.length > 0) {
            res.json(rows[0]);
        } else {
            res.status(404).json({ error: 'Tutor not found for this user ID' });
        }
    } catch (err) {
        console.error('Error fetching tutor by user ID:', err);
        res.status(500).json({ error: 'Failed to fetch tutor' });
    }
};