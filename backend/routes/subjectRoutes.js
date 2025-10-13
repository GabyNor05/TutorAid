const express = require('express');
const router = express.Router();


router.get('/', async (req, res) => {
    const pool = require('../config/db');
    try {
        const [rows] = await pool.query('SELECT * FROM Subjects');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch subjects" });
    }
});

module.exports = router;