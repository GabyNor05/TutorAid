const express = require('express');
const router = express.Router();
const studentRequestsController = require('../controllers/studentRequestsController');
const pool = require('../config/db');
const nodemailer = require('nodemailer');

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

router.post('/respond', async (req, res) => {
    const { toUserID, subject, message } = req.body;
    try {
        // Get user's email from Users table
        const [rows] = await pool.query("SELECT email FROM Users WHERE userID = ?", [toUserID]);
        if (!rows.length) {
            return res.status(404).json({ success: false, message: "User not found." });
        }
        const userEmail = rows[0].email;

        // Set up nodemailer transporter (configure with your SMTP details)
        const transporter = nodemailer.createTransport({
            host: 'smtp.example.com',
            port: 587,
            secure: false,
            auth: {
                user: 'your_email@example.com',
                pass: 'your_email_password'
            }
        });

        // Send the email
        await transporter.sendMail({
            from: '"TutorAid Admin" <your_email@example.com>',
            to: userEmail,
            subject,
            text: message
        });

        res.json({ success: true });
    } catch (err) {
        console.error("Error sending response email:", err);
        res.status(500).json({ success: false, message: "Error sending response email." });
    }
});

module.exports = router;