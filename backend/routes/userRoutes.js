require('dotenv').config();
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const pool = require('../config/db');

// Test user route
router.post('/test-user', userController.createTestUser);

// Normal CRUD routes
router.post('/', upload.single('image'), userController.createUser);
router.put('/:id', upload.single('image'), userController.updateUser);
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUser);
router.delete('/:id', userController.deleteUser);
router.post('/login', userController.loginUser);
router.post('/send-otp', userController.sendOtp);
router.post('/verify-otp', userController.verifyOtp);
router.get('/tutors/by-subject/:subject', userController.getTutorsBySubject);
router.get('/tutor/:userID/availability', userController.getTutorAvailability);
router.get('/students/by-user/:userID', userController.getStudentIDByUserID);
router.post('/add-staff', userController.addStaff);

// Change user status with correct admin password
router.post('/change-status', async (req, res) => {
    const { studentID, newStatus, adminPassword } = req.body;
    console.log("Change status request:", req.body);
    try {
        if (adminPassword !== process.env.ADMIN_PASSWORD) {
            return res.json({ success: false, message: "Incorrect admin password." });
        }
        await pool.query("UPDATE Students SET status = ? WHERE studentID = ?", [newStatus, studentID]);
        res.json({ success: true });
    } catch (err) {
        console.error("Change status error:", err);
        res.json({ success: false, message: "Error updating status." });
    }
});

// User removal with correct admin password
router.post('/remove-user', async (req, res) => {
    const { userID, adminPassword } = req.body;
    try {
        if (adminPassword !== process.env.ADMIN_PASSWORD) {
            return res.json({ success: false, message: "Incorrect admin password." });
        }
        const [result] = await pool.query("DELETE FROM Users WHERE userID = ?", [userID]);
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
    const { studentIDs } = req.body;
    if (!studentIDs || !studentIDs.length) return res.json({});
    try {
        const [rows] = await pool.query(
            `SELECT Students.studentID, Users.image, Users.name
             FROM Students 
             JOIN Users ON Students.userID = Users.userID 
             WHERE Students.studentID IN (?)`,
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

module.exports = router;


