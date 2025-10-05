const express = require('express');
const router = express.Router();
const studentRequestsController = require('../controllers/studentRequestsController');
const nodemailer = require('nodemailer');
const pool = require('../config/db');

router.post('/', studentRequestsController.createStudentRequest);
router.get('/', studentRequestsController.getAllStudentRequests);

router.post('/postpone', async (req, res) => {
    const { studentRequestID, adminPassword } = req.body;
    if (adminPassword !== process.env.ADMIN_PASSWORD) {
        return res.json({ success: false, message: "Incorrect admin password." });
    }
    try {
        await pool.query(
            "UPDATE StudentRequests SET status = 'Postponed' WHERE studentRequestID = ?",
            [studentRequestID]
        );
        res.json({ success: true });
    } catch (err) {
        res.json({ success: false, message: "Error updating status." });
    }
});

router.post('/reject', async (req, res) => {
    const { studentRequestID, adminPassword } = req.body;
    if (adminPassword !== process.env.ADMIN_PASSWORD) {
        return res.json({ success: false, message: "Incorrect admin password." });
    }
    try {
        await pool.query(
            "UPDATE StudentRequests SET status = 'Rejected' WHERE studentRequestID = ?",
            [studentRequestID]
        );
        res.json({ success: true });
    } catch (err) {
        res.json({ success: false, message: "Error updating status." });
    }
});

router.post('/respond', async (req, res) => {
    const { toUserID, subject, message, studentRequestID } = req.body;
    try {
        // Get user's email
        const [rows] = await pool.query("SELECT email FROM Users WHERE userID = ?", [toUserID]);
        if (!rows.length) {
            return res.status(404).json({ success: false, message: "User not found." });
        }
        const userEmail = rows[0].email;

        // Send email
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: userEmail,
            subject,
            text: message
        });

        // Update status to Completed
        await pool.query(
            "UPDATE StudentRequests SET status = 'Completed' WHERE studentRequestID = ?",
            [studentRequestID]
        );

        res.json({ success: true });
    } catch (err) {
        console.error("Error sending response email or updating status:", err);
        res.status(500).json({ success: false, message: "Error sending response email or updating status." });
    }
});

module.exports = router;