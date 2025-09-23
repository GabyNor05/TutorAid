const userModel = require('../models/userModel');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');
const bcrypt = require('bcryptjs');

// GET all users
 exports.getUsers = async (req, res) => {
    try {
        const users = await userModel.getAllUsers();
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}; 
 
// // GET single user by ID
exports.getUser = async (req, res) => {
    try {
        const user = await userModel.getUserById(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// CREATE new user
exports.createUser = async (req, res) => {
    try {
        // Handle image upload
        let imageUrl = null;
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path, { folder: "users" });
            imageUrl = result.secure_url;
            fs.unlinkSync(req.file.path); // Remove temp file
        }
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        const user = {
            ...req.body,
            password: hashedPassword,
            image: imageUrl,
        };

        const createdUser = await userModel.createUser(user);
        res.json(createdUser);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// UPDATE existing user
exports.updateUser = async (req, res) => {
    try {
        // Handle image upload
        let imageUrl = req.body.image || null;
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path, { folder: "users" });
            imageUrl = result.secure_url;
            fs.unlinkSync(req.file.path);
        }

        // Hash password if provided
        let password = req.body.password;
        if (password) {
            password = await bcrypt.hash(password, 10);
        }

        const user = {
            ...req.body,
            password: password || undefined,
            image: imageUrl
        };

        const updatedUser = await userModel.updateUser(req.params.id, user);
        res.json(updatedUser);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// DELETE user
exports.deleteUser = async (req, res) => {
    try {
        await userModel.deleteUser(req.params.id);
        res.json({ message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// test
exports.createTestUser = async (req, res) => {
    try {
        const randomImage = "https://via.placeholder.com/150";
        const hashedPassword = await bcrypt.hash("testpassword", 10);

        const testUser = {
            name: "Test User",
            email: "testuser" + Date.now() + "@example.com", // Make email unique for testing
            password: hashedPassword,
            role: "Student",
            image: randomImage,
            grade: "10",
            school: "Test High School",
            address: "123 Test St",
            status: "Active"
        };

        const createdUser = await userModel.createUser(testUser);
        console.log("Created user:", createdUser);
        res.json(createdUser);
    } catch (err) {
        console.error("Error creating test user:", err);
        res.status(500).json({ error: err.message });
    }
};

