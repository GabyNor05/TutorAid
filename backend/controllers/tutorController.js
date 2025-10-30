const pool = require('../config/db');

// List tutors (minimal fields)
async function getAllTutors(req, res) {
  try {
    // Primary query: join users for display fields
    const [rows] = await pool.query(
      `SELECT 
         t.tutorID,
         t.userID,
         u.name,
         u.email,
         u.image,
         t.fee_per_hour,
         t.experience,
         t.qualifications,
         t.subjects,
          t.availability,
          t.bio
       FROM tutors t
       JOIN users u ON u.userID = t.userID
       ORDER BY u.name ASC`
    );
    return res.json(rows);
  } catch (err) {
    console.error('[tutors:getAllTutors] primary query failed:', err?.code, err?.message);

    // Fallback: fetch separately and join in JS (handles missing columns or schema drift)
    try {
      const [tutors] = await pool.query(
        `SELECT tutorID, userID, COALESCE(fee_per_hour, 0) AS fee_per_hour FROM tutors`
      );
      const userIDs = tutors.map(t => t.userID).filter(Boolean);
      let usersById = {};
      if (userIDs.length) {
        const [users] = await pool.query(
          `SELECT userID, name, email, image FROM users WHERE userID IN (?)`,
          [userIDs]
        );
        usersById = Object.fromEntries(users.map(u => [u.userID, u]));
      }
      const merged = tutors.map(t => {
        const u = usersById[t.userID] || {};
        return {
          tutorID: t.tutorID,
          userID: t.userID,
          name: u.name || null,
          email: u.email || null,
          image: u.image || null,
          fee_per_hour: t.fee_per_hour ?? null,
        };
      });
      return res.json(merged);
    } catch (err2) {
      console.error('[tutors:getAllTutors] fallback failed:', err2?.code, err2?.message);
      return res.status(500).json({ error: 'Failed to fetch tutors' });
    }
  }
}

// Tutors who teach :subject (subjects stored comma-separated)
async function getTutorsBySubject(req, res) {
  const { subject } = req.params;
  try {
    const token = String(subject || '').replace(/\s+/g, '');
    const [rows] = await pool.query(
      `SELECT t.tutorID, t.userID, t.subjects, t.availability, t.bio, t.fee_per_hour, t.experience, t.qualifications, u.name, u.image
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
  // match routes/tutorRoutes.js -> '/:id/availability'
  const { id } = req.params;
  try {
    const [rows] = await pool.query(
      `SELECT availability FROM tutors WHERE tutorID = ?`,
      [id]
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

// Optional: keep a simple byId used elsewhere
async function getById(req, res) {
  try {
    const { id } = req.params;
    const [[row]] = await pool.query(
      `SELECT t.tutorID, t.userID, u.name, u.email, u.image, t.fee_per_hour
       FROM tutors t
       JOIN users u ON u.userID = t.userID
       WHERE t.tutorID = ?
       LIMIT 1`,
      [id]
    );
    if (!row) return res.status(404).json({ error: 'Tutor not found' });
    res.json(row);
  } catch (err) {
    console.error('[tutors:getById] error:', err);
    res.status(500).json({ error: 'Failed to fetch tutor' });
  }
}

module.exports = {
  getAllTutors,
  getTutorsBySubject,
  getTutorAvailability,
  getTutorByUserID,
  updateTutorByUserID,
  getById, // ADD: export the handler
};