const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.post('/', async (req, res) => {
    const { subjectName, subjectDescription, dateRequested } = req.body;
    try {
        await pool.query(
            "INSERT INTO NewSubjectRequests (subjectName, subjectDescription, dateRequested) VALUES (?, ?, ?)",
            [subjectName, subjectDescription, dateRequested]
        );
        res.json({ success: true });
    } catch (err) {
        console.error("Error storing new subject request:", err);
        res.status(500).json({ success: false, message: "Error storing new subject request." });
    }
});

module.exports = router;