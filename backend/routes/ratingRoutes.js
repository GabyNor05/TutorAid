const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
    const pool = require('../config/db');
    const { tutorID, studentID, rating, comment } = req.body;
    try {
        await pool.query(
            "INSERT INTO rating (tutorID, studentID, rating, comment) VALUES (?, ?, ?, ?)",
            [tutorID, studentID, rating, comment]
        );
        res.status(201).json({ message: "Rating submitted!" });
    } catch (err) {
        res.status(500).json({ error: "Failed to submit rating" });
    }
});

module.exports = router;