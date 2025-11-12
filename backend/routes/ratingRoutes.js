const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// CREATE rating (existing)
router.post('/', async (req, res) => {
  const { tutorID, studentID, rating, comment } = req.body || {};
  if (!tutorID || !studentID || !rating) return res.status(400).json({ error: 'tutorID, studentID, rating required' });
  try {
    await pool.query(
      'INSERT INTO rating (tutorID, studentID, rating, comment) VALUES (?, ?, ?, ?)',
      [tutorID, studentID, rating, comment || null]
    );
    res.status(201).json({ message: 'Rating submitted!' });
  } catch (err) {
    res.status(500).json({ error: err.sqlMessage || 'Failed to submit rating' });
  }
});

// GET all ratings for a tutor (with student names + summary)
router.get('/tutor/:tutorID', async (req, res) => {
  const tutorID = Number(req.params.tutorID);
  if (!tutorID) return res.status(400).send('Invalid tutorID');
  try {
    const [rows] = await pool.query(
      `SELECT r.ratingID, r.tutorID, r.studentID, r.rating, r.comment, r.created_at,
              u.name AS studentName
       FROM rating r
       JOIN students s ON r.studentID = s.studentID
       JOIN users u ON s.userID = u.userID
       WHERE r.tutorID = ?
       ORDER BY r.created_at DESC`,
      [tutorID]
    );
    const [agg] = await pool.query(
      `SELECT AVG(rating) AS avgRating, COUNT(*) AS numRatings
       FROM rating WHERE tutorID = ?`,
      [tutorID]
    );
    const summary = {
      avgRating: Number(agg[0]?.avgRating || 0),
      numRatings: Number(agg[0]?.numRatings || 0),
    };
    res.json({ summary, reviews: rows });
  } catch (err) {
    res.status(500).send(err.sqlMessage || err.message || 'Failed to fetch ratings');
  }
});

// OPTIONAL: aggregate for all tutors (to avoid N calls)
router.get('/summary', async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT tutorID, AVG(rating) AS avgRating, COUNT(*) AS numRatings
       FROM rating GROUP BY tutorID`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).send(err.sqlMessage || err.message || 'Failed to fetch rating summary');
  }
});

module.exports = router;