const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// Test user route
router.post('/test-user', userController.createTestUser);

// Normal CRUD routes
router.post('/', upload.single('image'), userController.createUser);
router.put('/:id', upload.single('image'), userController.updateUser);
router.get('/', userController.getUsers);
router.get('/:id', userController.getUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;
