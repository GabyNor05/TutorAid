// Get all tutors
exports.getAllTutors = async (req, res) => {
  const pool = require('../config/db');
  try {
    const [rows] = await pool.query(`
      SELECT 
        t.*,
        u.name,
        u.image,
        COALESCE(r.avg_rating, 0) AS rating,
        COALESCE(r.num_ratings, 0) AS num_ratings
      FROM tutors t
      JOIN users u ON t.userID = u.userID
      LEFT JOIN (
        SELECT tutorID, ROUND(AVG(rating), 1) AS avg_rating, COUNT(ratingID) AS num_ratings
        FROM rating
        GROUP BY tutorID
      ) r ON r.tutorID = t.tutorID
      ORDER BY t.tutorID DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error('Failed to fetch tutors:', err.code, err.sqlMessage || err.message);
    res.status(500).json({ error: 'Failed to fetch tutors' });
  }
};

// Get single tutor by ID
exports.getTutorById = async (req, res) => {
  const pool = require('../config/db');
  try {
    const tutorID = req.params.id;
    const [rows] = await pool.query(
      `
      SELECT t.*, u.name, u.image, u.bio, u.subjects, u.qualifications, u.availability
      FROM tutors t 
      JOIN users u ON t.userID = u.userID 
      WHERE t.tutorID = ?
      `,
      [tutorID]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Tutor not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Failed to fetch tutor:', err.code, err.sqlMessage || err.message);
    res.status(500).json({ error: 'Failed to fetch tutor' });
  }
};

// Create a new tutor
exports.createTutor = async (req, res) => {
    const pool = require('../config/db');
    try {
        const { userID, fee_per_hour, experience, bio, subjects, qualifications, availability } = req.body;
        await pool.query(
            "INSERT INTO tutors (userID, fee_per_hour, experience, bio, subjects, qualifications, availability) VALUES (?, ?, ?, ?, ?, ?, ?)",
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
            "UPDATE tutors SET fee_per_hour = ?, experience = ?, bio = ?, subjects = ?, qualifications = ?, availability = ? WHERE tutorID = ?",
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

exports.getTutorByUserID = async (req, res) => {
  const pool = require('../config/db');
  const { userID } = req.params;
  try {
    const [rows] = await pool.query(
      `SELECT t.*, u.name, u.image
       FROM tutors t
       LEFT JOIN users u ON t.userID = u.userID
       WHERE t.userID = ?`,
      [userID]
    );
    if (rows.length) return res.json(rows[0]);
    return res.status(404).json({ error: 'Tutor not found' });
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch tutor' });
  }
};

exports.saveTutorProfile = async (req, res) => {
  const pool = require('../config/db');
  const { userID } = req.params;
  const {
    bio = '',
    subjects = '',
    qualifications = '',
    availability = '',
    fee_per_hour = 0,
    experience = '',
  } = req.body;

  try {
    const [u] = await pool.query('SELECT userID FROM users WHERE userID = ?', [userID]);
    if (!u.length) return res.status(404).json({ error: 'User not found' });

    const [rows] = await pool.query('SELECT userID FROM tutors WHERE userID = ?', [userID]);
    if (rows.length) {
      await pool.query(
        `UPDATE tutors
         SET bio = ?, subjects = ?, qualifications = ?, availability = ?, fee_per_hour = ?, experience = ?
         WHERE userID = ?`,
        [bio, subjects, qualifications, availability, fee_per_hour, experience, userID]
      );
    } else {
      await pool.query(
        `INSERT INTO tutors (userID, bio, subjects, qualifications, availability, fee_per_hour, experience)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [userID, bio, subjects, qualifications, availability, fee_per_hour, experience]
      );
    }
    res.json({ ok: true, userID: Number(userID) });
  } catch (e) {
    console.error('saveTutorProfile error:', e);
    res.status(500).json({ error: 'Failed to save tutor profile' });
  }
};

const pool = require('../config/db');

// Return tutors who teach :subject
exports.getTutorsBySubject = async (req, res) => {
  const { subject } = req.params;
  try {
    // If your Tutors table stores a comma-separated "subjects" field
    const [rows] = await pool.query(
      `SELECT t.tutorID, u.userID, u.name
       FROM Tutors t
       JOIN users u ON t.userID = u.userID
       WHERE REPLACE(t.subjects, ' ', '') LIKE CONCAT('%', REPLACE(?, ' ', ''), '%')`,
      [subject]
    );
    res.json(rows);
  } catch (err) {
    console.error('getTutorsBySubject error:', err);
    res.status(500).json({ error: 'Failed to fetch tutors' });
  }
};

// Return availability string for a tutor
exports.getTutorAvailability = async (req, res) => {
  const { tutorID } = req.params;
  try {
    const [rows] = await pool.query(
      `SELECT availability FROM Tutors WHERE tutorID = ?`,
      [tutorID]
    );
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('getTutorAvailability error:', err);
    res.status(500).json({ error: 'Failed to fetch availability' });
  }
};