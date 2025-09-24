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

// CREATE new user with role-specific data
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

        // Build user object for Users table
        const user = {
            image: imageUrl,
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword,
            role: req.body.role
        };

        // Create user in Users table and get userID
        const createdUser = await userModel.createUser(user);

        // Insert into role-specific table
        if (user.role === "Tutor") {
            await userModel.createTutor({
                userID: createdUser.userID,
                bio: req.body.bio || "",
                subjects: req.body.subjects || "",
                qualifications: req.body.qualifications || "",
                availability: req.body.availability || ""
            });
        } else if (user.role === "Student") {
            await userModel.createStudent({
                userID: createdUser.userID,
                grade: req.body.grade || "",
                school: req.body.school || "",
                address: req.body.address || "",
                status: req.body.status || "Active"
            });
        } else if (user.role === "Admin") {
            await userModel.createAdmin({
                userID: createdUser.userID
            });
        }

        res.json(createdUser);
    } catch (err) {
        console.error("Error in createUser:", err); // <-- Add this line
        res.status(500).json({ error: err.message });
    }
};

// UPDATE existing user
exports.updateUser = async (req, res) => {
    try {
        // Only update Users table if user info is present
        if (req.body.name || req.body.email || req.body.password || req.body.role || req.body.image) {
            await userModel.updateUser(req.params.id, req.body);
        }

        // Only update student info if role is Student
        if (req.body.role === "Student") {
            await userModel.updateStudent(req.params.id, {
                grade: req.body.grade || null,
                school: req.body.school || null,
                address: req.body.address || null,
                city: req.body.city || null,
                province: req.body.province || null,
                status: req.body.status || "Active"
            });
        }

        res.json({ message: "User updated" });
    } catch (err) {
        console.error("Error in updateUser:", err);
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
        const randomImage = "https://picsum.photos/id/28/200/300";
        const hashedPassword = await bcrypt.hash("testpassword", 10);

        const testUser = {
            name: "Sophie Leighton",
            email: "sophleighton" + Date.now() + "@example.com", // Make email unique for testing
            password: hashedPassword,
            role: "Tutor",
            image: randomImage,
            bio: "Very enthusiastic tutor with a passion for teaching.",
            subjects: "Mathematics, Physics",
            qualifications:  "M.Sc. in Physics",
            availability:  "Weekdays 10 AM - 2 PM"
        };

        const createdUser = await userModel.createUser(testUser);
        console.log("Created user:", createdUser);
        res.json(createdUser);
    } catch (err) {
        console.error("Error creating test user:", err);
        res.status(500).json({ error: err.message });
    }
};

