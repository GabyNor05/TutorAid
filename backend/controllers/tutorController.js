const pool = require('../config/db');

exports.getAllTutors = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        t.tutorID,
        t.userID,
        u.name,
        u.email,
        u.image,
        t.fee_per_hour,
        GROUP_CONCAT(DISTINCT s.name ORDER BY s.name SEPARATOR ', ') AS subjects,
        ROUND(AVG(r.rating), 1) AS rating,
        COUNT(r.ratingID) AS num_ratings
      FROM tutors t
      JOIN users u ON u.userID = t.userID
      LEFT JOIN tutor_subjects ts ON ts.tutorID = t.tutorID
      LEFT JOIN subjects s ON s.subjectID = ts.subjectID
      LEFT JOIN ratings r ON r.tutorID = t.tutorID
      GROUP BY t.tutorID, t.userID, u.name, u.email, u.image, t.fee_per_hour
      ORDER BY u.name ASC
    `);
    res.json(rows);
  } catch (err) {
    console.error('[tutors:getAllTutors] error:', err);
    res.status(500).json({ error: 'Failed to fetch tutors' });
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const [[row]] = await pool.query(`
      SELECT
        t.tutorID,
        t.userID,
        u.name,
        u.email,
        u.image,
        t.fee_per_hour,
        t.experience,
        t.qualifications,
        t.bio,
        GROUP_CONCAT(DISTINCT s.name ORDER BY s.name SEPARATOR ', ') AS subjects,
        ROUND(AVG(r.rating), 1) AS rating,
        COUNT(r.ratingID) AS num_ratings
      FROM tutors t
      JOIN users u ON u.userID = t.userID
      LEFT JOIN tutor_subjects ts ON ts.tutorID = t.tutorID
      LEFT JOIN subjects s ON s.subjectID = ts.subjectID
      LEFT JOIN ratings r ON r.tutorID = t.tutorID
      WHERE t.tutorID = ?
      GROUP BY t.tutorID, t.userID, u.name, u.email, u.image, t.fee_per_hour, t.experience, t.qualifications, t.bio
      LIMIT 1
    `, [id]);
    if (!row) return res.status(404).json({ error: 'Tutor not found' });
    res.json(row);
  } catch (err) {
    console.error('[tutors:getById] error:', err);
    res.status(500).json({ error: 'Failed to fetch tutor' });
  }
};