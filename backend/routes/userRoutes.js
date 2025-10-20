const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const userController = require('../controllers/userController');

// Auth + OTP
router.post('/login', userController.loginUser);
router.post('/send-otp', userController.sendOtp);
router.post('/verify-otp', userController.verifyOtp);
router.get('/email-health', userController.emailHealth);

// Admin utilities
router.post('/change-status', userController.changeStatus);
router.post('/remove-user', userController.removeUser);
router.post('/user-avatars', userController.userAvatars);

// Users CRUD
router.post('/', upload.single('image'), userController.createUser);
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUser);
router.put('/:id', upload.single('image'), userController.updateUser);
router.put('/:id/assign-role', userController.assignRole);
router.delete('/:id', userController.deleteUser);

module.exports = router;


