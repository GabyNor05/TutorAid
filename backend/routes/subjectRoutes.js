const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Subjects');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch subjects" });
    }
});

module.exports = router;