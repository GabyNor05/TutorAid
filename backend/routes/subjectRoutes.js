const express = require('express');
const router = express.Router();

router.get('/', async (_req, res) => {
  const pool = require('../config/db');
  try {
    const [rows] = await pool.query('SELECT * FROM subjects ORDER BY name ASC');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching subjects:', err); // will show sqlMessage/table not found/etc
    res.status(500).json({
      error: 'Failed to fetch subjects',
      code: err.code,
      sqlMessage: err.sqlMessage,
    });
  }
});

module.exports = router;