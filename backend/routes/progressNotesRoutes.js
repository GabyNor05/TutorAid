const express = require('express');
const router = express.Router();
const multer = require('multer');
const progressNotesController = require('../controllers/progressNotesController');
const pool = require('../config/db');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/progressnotes/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage });

router.post('/upload', upload.single('file'), progressNotesController.uploadProgressNote);
router.get('/student/:studentID', progressNotesController.getNotesByStudentID);
router.get('/student/:studentID/lesson-notes', async (req, res) => {
    const { studentID } = req.params;
    try {
        const [rows] = await pool.query(
            "SELECT * FROM ProgressNotes WHERE studentID = ? AND file_name LIKE 'lesson-feedback-%'",
            [studentID]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch progress notes" });
    }
});

module.exports = router;