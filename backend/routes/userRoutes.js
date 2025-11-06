const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

// Safe handler wrapper (prevents "argument handler must be a function")
const h = (name) => {
  const fn = userController?.[name];
  if (typeof fn !== 'function') {
    return (req, res) => {
      console.error(`[userRoutes] Missing handler userController.${name}`);
      res.status(501).send(`Handler missing: ${name}`);
    };
  }
  return fn;
};

// Auth
router.post('/login', h('login'));                 // uses userController.login
router.post('/send-otp', h('sendOtp'));
router.post('/verify-otp', h('verifyOtp'));

// Forgot password
router.post('/forgot-password/request', h('forgotPasswordRequest'));
router.post('/forgot-password/verify', h('forgotPasswordVerify'));
router.post('/:id/password', h('resetPasswordByUserID'));

// Admin actions
router.post('/change-status', h('changeStatus'));  // POST { userID, newStatus, adminPassword }
router.post('/remove-user', h('removeUser'));      // POST { userID, adminPassword }

// Helper endpoints used by frontend
router.post('/user-avatars', h('userAvatars'));

// Staff management
router.post('/add-staff', h('addStaff'));
router.post('/:id/assign-role', h('assignRole'));

// Users CRUD (multipart for image on create/update)
router.get('/', h('getUsers'));
router.get('/:id', h('getUser'));
router.post('/', upload.single('image'), h('createUser'));     // <— ADD multer
router.patch('/:id', upload.single('image'), h('updateUser')); // <— ADD multer
router.delete('/:id', h('deleteUser'));

module.exports = router;


