const express = require('express');
const router = express.Router();

router.get('/', async (_req, res) => {
  const pool = require('../config/db');
  try {
    const [rows] = await pool.query('SELECT * FROM Subjects ORDER BY name ASC');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching subjects:', err);
    res.status(500).json({ error: 'Failed to fetch subjects' });
  }
});

module.exports = router;