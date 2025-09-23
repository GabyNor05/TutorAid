const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // Temporary storage
const userModel = require('../models/userModel');

router.post('/', upload.single('image'), userController.createUser);
router.put('/:id', upload.single('image'), userController.updateUser);

router.get('/', userController.getUsers);
router.get('/:id', userController.getUser);
router.delete('/:id', userController.deleteUser);

router.post('/test-user', async (req, res) => {
    try {
        const randomImage = "https://via.placeholder.com/150";
        const testUser = {
            image: randomImage,
            name: "Test User",
            email: "testuser@example.com",
            password: "testpassword",
            role: "student"
        };
        const createdUser = await userModel.createUser(testUser);
        res.json(createdUser);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;