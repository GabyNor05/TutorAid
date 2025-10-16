const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// Test user route
router.post('/test-user', userController.createTestUser);

// Auth/OTP and health BEFORE :id
router.post('/login', userController.loginUser);
router.post('/send-otp', userController.sendOtp);
router.post('/verify-otp', userController.verifyOtp);
router.get('/email-health', userController.emailHealth);
router.get('/email-tcp-check', userController.smtpTcpCheck);

// Other specific routes
router.get('/tutors/by-subject/:subject', userController.getTutorsBySubject);
router.get('/tutor/:userID/availability', userController.getTutorAvailability);
router.get('/students/by-user/:userID', userController.getStudentIDByUserID);
router.post('/add-staff', userController.addStaff);

// Change user status with correct admin password
router.post('/change-status', async (req, res) => {
    const pool = require('../config/db');
    const { userID, newStatus, adminPassword } = req.body;

    if (adminPassword !== process.env.ADMIN_PASSWORD) {
        return res.json({ success: false, message: "Incorrect admin password." });
    }
    try {
        // Find studentID for this userID
        const [studentRows] = await pool.query(
            "SELECT studentID FROM students WHERE userID = ?",
            [userID]
        );
        if (!studentRows.length) {
            return res.json({ success: false, message: "Student not found." });
        }
        const studentID = studentRows[0].studentID;

        // Update status
        const [result] = await pool.query(
            "UPDATE students SET status = ? WHERE studentID = ?",
            [newStatus, studentID]
        );
        if (result.affectedRows === 0) {
            return res.json({ success: false, message: "Student not found." });
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error updating status." });
    }
});

// User removal with correct admin password
router.post('/remove-user', async (req, res) => {
    const pool = require('../config/db');
    const { userID, adminPassword } = req.body;
    try {
        if (adminPassword !== process.env.ADMIN_PASSWORD) {
            return res.json({ success: false, message: "Incorrect admin password." });
        }
        const [result] = await pool.query("DELETE FROM users WHERE userID = ?", [userID]);
        if (result.affectedRows === 0) {
            return res.json({ success: false, message: "User not found." });
        }
        res.json({ success: true });
    } catch (err) {
        res.json({ success: false, message: "Error removing user.", error: err.message });
    }
});

// Get user avatars and names for a studentID
router.post('/user-avatars', async (req, res) => {
    const pool = require('../config/db');
    const { studentIDs } = req.body;
    if (!studentIDs || !studentIDs.length) return res.json({});
    try {
        const [rows] = await pool.query(
            `SELECT students.studentID, users.image, users.name
             FROM students
             JOIN users ON students.userID = users.userID
             WHERE students.studentID IN (?)`,
            [studentIDs]
        );
        const images = {};
        rows.forEach(row => {
            images[row.studentID] = { image: row.image, name: row.name };
        });
        res.json(images);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch user images" });
    }
});

// Normal CRUD routes
router.post('/', upload.single('image'), userController.createUser);
router.get('/', userController.getAllUsers);
router.put('/:id', upload.single('image'), userController.updateUser);
router.get('/:id', userController.getUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;


