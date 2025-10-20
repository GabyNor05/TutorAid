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

// Admin utilities
router.post('/change-status', userController.changeStatus);
router.post('/remove-user', userController.removeUser);
router.post('/user-avatars', userController.userAvatars);

// Users CRUD
add('post', '/', upload.single('image'), userController.createUser);
add('get', '/', userController.getAllUsers);
add('get', '/:id', userController.getUser);
add('put', '/:id', upload.single('image'), userController.updateUser);
add('put', '/:id/assign-role', userController.assignRole);
add('delete', '/:id', userController.deleteUser);

module.exports = router;


