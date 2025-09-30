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

// Change user status with admin password check
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

// Remove user with admin password check
router.post('/remove-user', async (req, res) => {
    const { userID, adminPassword } = req.body;
    console.log("Remove user request:", req.body); // Debug log
    try {
        // Compare with .env value
        if (adminPassword !== process.env.ADMIN_PASSWORD) {
            console.log("Admin password incorrect."); // Debug log
            return res.json({ success: false, message: "Incorrect admin password." });
        }
        const [result] = await pool.query("DELETE FROM Users WHERE userID = ?", [userID]);
        console.log("SQL DELETE result:", result); // Log SQL result
        if (result.affectedRows === 0) {
            console.log("No user deleted. User not found for userID:", userID);
            return res.json({ success: false, message: "User not found." });
        }
        console.log("User deleted successfully for userID:", userID);
        res.json({ success: true });
    } catch (err) {
        console.error("Error removing user:", err); // Log error details
        res.json({ success: false, message: "Error removing user.", error: err.message });
    }
});

module.exports = router;


