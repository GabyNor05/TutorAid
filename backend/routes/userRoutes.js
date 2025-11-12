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

router.post('/user-avatars', h('userAvatars'));

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
router.get('/tutor/:userID/availability', h('getTutorAvailability'));
router.get('/student-id/:userID', h('getStudentIDByUserID'));


// Staff management
router.post('/add-staff', h('addStaff'));
router.post('/:id/assign-role', h('assignRole'));

// Users CRUD (multipart for image)
router.get('/', userController.getUsers);
router.get('/:id', userController.getUser);
router.post('/', upload.single('image'), userController.createUser); // JSON works; multer ignores when not multipart
router.patch('/:id', upload.single('image'), userController.updateUser); // CHANGE: add multer
router.put('/:id', upload.single('image'), userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;


