const pool = require('../config/db');

// List tutors (minimal fields)
async function getAllTutors(_req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT t.tutorID, t.userID, t.subjects, t.availability, t.fee_per_hour, u.name, u.image
       FROM tutors t
       JOIN users u ON t.userID = u.userID`
    );
    res.json(rows);
  } catch (err) {
    console.error('getAllTutors error:', err);
    res.status(500).json({ error: 'Failed to fetch tutors' });
  }
}

// Tutors who teach :subject (subjects stored comma-separated)
async function getTutorsBySubject(req, res) {
  const { subject } = req.params;
  try {
    const token = String(subject || '').replace(/\s+/g, '');
    const [rows] = await pool.query(
      `SELECT t.tutorID, t.userID, u.name, u.image
       FROM tutors t
       JOIN users u ON t.userID = u.userID
       WHERE CONCAT(',', REPLACE(REPLACE(IFNULL(t.subjects,''), ', ', ','), ' ', ''), ',')
             LIKE CONCAT('%,', ?, ',%')`,
      [token]
    );
    res.json(rows);
  } catch (err) {
    console.error('getTutorsBySubject error:', err);
    res.status(500).json({ error: 'Failed to fetch tutors' });
  }
}

// Availability by tutorID
async function getTutorAvailability(req, res) {
  const { tutorID } = req.params;
  try {
    const [rows] = await pool.query(
      `SELECT availability FROM tutors WHERE tutorID = ?`,
      [tutorID]
    );
    if (!rows.length) return res.status(404).json({ error: 'Tutor not found' });
    res.json({ availability: rows[0].availability || '' });
  } catch (err) {
    console.error('getTutorAvailability error:', err);
    res.status(500).json({ error: 'Failed to fetch availability' });
  }
}

// Tutor profile by userID
async function getTutorByUserID(req, res) {
  const { userID } = req.params;
  try {
    const [rows] = await pool.query(
      `SELECT userID, bio, subjects, qualifications, availability, fee_per_hour, experience
       FROM tutors WHERE userID = ? LIMIT 1`,
      [userID]
    );
    if (!rows.length) return res.status(404).json({ error: 'Tutor not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('getTutorByUserID error:', err);
    res.status(500).json({ error: 'Failed to fetch tutor' });
  }
}

// Update tutor by userID
async function updateTutorByUserID(req, res) {
  const { userID } = req.params;
  const { bio, subjects, qualifications, availability, fee_per_hour, experience } = req.body || {};
  try {
    const [result] = await pool.query(
      `UPDATE tutors
       SET bio = ?, subjects = ?, qualifications = ?, availability = ?, fee_per_hour = ?, experience = ?
       WHERE userID = ?`,
      [bio || '', subjects || '', qualifications || '', availability || '', fee_per_hour ?? 0, experience || '', userID]
    );

    if (result.affectedRows === 0) {
      // UPSERT if tutor row doesn't exist yet
      const [ins] = await pool.query(
        `INSERT INTO tutors (userID, bio, subjects, qualifications, availability, fee_per_hour, experience)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [userID, bio || '', subjects || '', qualifications || '', availability || '', fee_per_hour ?? 0, experience || '']
      );
      const [rows] = await pool.query(
        `SELECT userID, bio, subjects, qualifications, availability, fee_per_hour, experience
         FROM tutors WHERE userID = ? LIMIT 1`,
        [userID]
      );
      return res.json(rows[0]);
    }

    const [rows] = await pool.query(
      `SELECT userID, bio, subjects, qualifications, availability, fee_per_hour, experience
       FROM tutors WHERE userID = ? LIMIT 1`,
      [userID]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error('updateTutorByUserID error:', err);
    res.status(500).json({ error: 'Failed to update tutor' });
  }
}

module.exports = {
  getAllTutors,
  getTutorsBySubject,
  getTutorAvailability,
  getTutorByUserID,
  updateTutorByUserID,
};