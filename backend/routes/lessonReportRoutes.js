const express = require('express');
const router = express.Router();
const lessonReportController = require('../controllers/lessonReportController');
const pool = require('../config/db'); // <-- Add this line

router.post('/', lessonReportController.createLessonReport);
router.get('/', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM LessonReports ORDER BY reportDate DESC');
  res.json(rows);
});

router.post('/escalate', async (req, res) => {
  const { lessonReportID, adminPassword } = req.body;
  if (adminPassword !== process.env.ADMIN_PASSWORD) {
    return res.json({ success: false, message: "Incorrect admin password." });
  }
  try {
    // Get studentID from the report
    const [reportRows] = await pool.query(
      "SELECT studentID FROM LessonReports WHERE lessonReportID = ?",
      [lessonReportID]
    );
    if (!reportRows.length) {
      return res.json({ success: false, message: "Report not found." });
    }
    const studentID = reportRows[0].studentID;

    // Increment strikes
    await pool.query(
      "UPDATE students SET strikes = strikes + 1 WHERE studentID = ?",
      [studentID]
    );

    // Check if strikes >= 3 and block if needed
    const [studentRows] = await pool.query(
      "SELECT strikes FROM students WHERE studentID = ?",
      [studentID]
    );
    if (studentRows[0].strikes >= 3) {
      await pool.query(
        "UPDATE students SET status = 'Blocked' WHERE studentID = ?",
        [studentID]
      );
    }

    // Update report status
    await pool.query(
      "UPDATE LessonReports SET status = 'Escalated' WHERE lessonReportID = ?",
      [lessonReportID]
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error updating status." });
  }
});

router.post('/ignore', async (req, res) => {
  const { lessonReportID, adminPassword } = req.body;
  if (adminPassword !== process.env.ADMIN_PASSWORD) {
    return res.json({ success: false, message: "Incorrect admin password." });
  }
  try {
    await pool.query(
      "UPDATE LessonReports SET status = 'Ignored' WHERE lessonReportID = ?",
      [lessonReportID]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error updating status." });
  }
});

module.exports = router;