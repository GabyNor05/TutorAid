const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const userController = require('../controllers/userController');

// helper to safely attach routes (supports middleware chain)
function add(method, path, ...handlers) {
  const fns = handlers.flat().filter(h => typeof h === 'function');
  if (!fns.length) {
    console.error(`[routes] ${method.toUpperCase()} ${path} not attached: no valid handlers`);
    return;
  }
  router[method](path, ...fns);
}

// Auth & OTP
add('post', '/login', userController.loginUser);
add('post', '/send-otp', userController.sendOtp);
add('post', '/verify-otp', userController.verifyOtp);
add('get', '/email-health', userController.emailHealth);
add('get', '/email-tcp-check', userController.smtpTcpCheck);
add('get', '/email-dns', userController.emailDns);

// Feature endpoints
add('get', '/tutors/by-subject/:subject', userController.getTutorsBySubject);
add('get', '/tutor/:userID/availability', userController.getTutorAvailability);
add('get', '/students/by-user/:userID', userController.getStudentIDByUserID);
add('post', '/add-staff', upload.single('image'), userController.addStaff);

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

// Users CRUD
add('post', '/', upload.single('image'), userController.createUser);
add('get', '/', userController.getAllUsers);
add('get', '/:id', userController.getUser);
add('put', '/:id', upload.single('image'), userController.updateUser);
add('put', '/:id/assign-role', userController.assignRole);
add('delete', '/:id', userController.deleteUser);

module.exports = router;


