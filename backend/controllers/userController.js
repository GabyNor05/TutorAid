const userModel = require('../models/userModel');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});
const otpStore = {};

// --- Controller Functions ---

exports.getUsers = async (req, res) => {
    try {
        const users = await userModel.getAllUsers();
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getAllUsers = async (req, res) => {
    const pool = require('../config/db');
    try {
        const [rows] = await pool.query(`
            SELECT u.*, s.status FROM Users u LEFT JOIN Students s ON u.userID = s.userID
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch users" });
    }
};

exports.getUser = async (req, res) => {
    const pool = require('../config/db');
    try {
        const user = await userModel.getUserById(req.params.id);
        if (!user) return res.status(404).json({ error: "User not found" });
        if (user.role === "Student") {
            const [studentRows] = await pool.query("SELECT studentID FROM students WHERE userID = ?", [user.userID]);
            if (studentRows.length) user.studentID = studentRows[0].studentID;
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createUser = async (req, res) => {
    try {
        let imageUrl = null;
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path, { folder: "users" });
            imageUrl = result.secure_url;
            fs.unlinkSync(req.file.path);
        }
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const user = {
            image: imageUrl,
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword,
            role: req.body.role,
        };
        const createdUser = await userModel.createUser(user);

        if (user.role === "Tutor") {
            const subjectsString = Array.isArray(req.body.subjects) ? req.body.subjects.filter(s => s).join(", ") : req.body.subjects || "";
            await userModel.createTutor({
                userID: createdUser.userID,
                bio: req.body.bio || "",
                subjects: subjectsString,
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
        }

        res.json(createdUser);
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: "An account with this email already exists." });
        res.status(500).json({ error: "Signup failed. Please try again." });
    }
};

exports.updateUser = async (req, res) => {
    try {
        let imageUrl;
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path, { folder: "uploads" });
            imageUrl = result.secure_url;
            fs.unlinkSync(req.file.path);
        }
        const updateData = { ...req.body };
        if (imageUrl) updateData.image = imageUrl;
        await userModel.updateUser(req.params.id, updateData);
        if (updateData.grade !== undefined || updateData.school !== undefined || updateData.address !== undefined || updateData.status !== undefined) {
            await userModel.updateStudent(req.params.id, { grade: updateData.grade, school: updateData.school, address: updateData.address, status: updateData.status });
        }
        const updatedUser = await userModel.getUserById(req.params.id);
        res.json(updatedUser);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        await userModel.deleteUser(req.params.id);
        res.json({ message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createTestUser = async (req, res) => {
    try {
        const randomImage = "https://picsum.photos/id/28/200/300";
        const hashedPassword = await bcrypt.hash("testpassword", 10);
        const testUser = { name: "Sophie Leighton", email: "sophleighton" + Date.now() + "@example.com", password: hashedPassword, role: "Tutor", image: randomImage, bio: "Very enthusiastic tutor with a passion for teaching.", subjects: "Mathematics, Physics", qualifications: "M.Sc. in Physics", availability: "Weekdays 10 AM - 2 PM" };
        const createdUser = await userModel.createUser(testUser);
        res.json(createdUser);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.loginUser = async (req, res) => {
    const pool = require('../config/db');
    const { email, password } = req.body;
    try {
        const user = await userModel.getUserByEmail(email);
        if (!user) return res.status(401).json({ error: "Invalid email or password" });
        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).json({ error: "Invalid email or password" });
        await pool.query("UPDATE Users SET lastLogin = NOW() WHERE userID = ?", [user.userID]);
        let student = null;
        if (user.role === "Student") {
            const [studentRows] = await pool.query("SELECT * FROM students WHERE userID = ?", [user.userID]);
            if (studentRows.length) {
                student = studentRows[0];
                if (student.status === "Blocked") return res.json({ userID: user.userID, student: { studentID: student.studentID, status: "Blocked" } });
                if (student.status === "Inactive") {
                    await pool.query("UPDATE students SET status = 'Active' WHERE studentID = ?", [student.studentID]);
                    student.status = "Active";
                }
            }
        }
        if (student) return res.json({ userID: user.userID, student });
        res.json({ userID: user.userID, name: user.name, email: user.email, role: user.role });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
};

exports.sendOtp = async (req, res) => {
    const { email } = req.body;
    try {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        otpStore[email] = { otp, createdAt: Date.now() };
        await transporter.sendMail({ from: process.env.EMAIL_USER, to: email, subject: "Your OTP Code", text: `Your OTP is: ${otp}` });
        res.json({ message: "OTP sent" });
    } catch (err) {
        res.status(500).json({ error: "Failed to send OTP" });
    }
};

exports.verifyOtp = async (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ error: "Missing email or OTP" });
    const record = otpStore[email];
    if (!record) return res.status(400).json({ error: "Invalid OTP" });
    if (Date.now() - record.createdAt > 60000) {
        delete otpStore[email];
        return res.status(400).json({ error: "OTP expired" });
    }
    if (record.otp === otp) {
        delete otpStore[email];
        return res.json({ success: true });
    }
    return res.status(400).json({ error: "Invalid OTP" });
};

exports.getTutorsBySubject = async (req, res) => {
    const pool = require('../config/db');
    const subject = req.params.subject;
    try {
        const [rows] = await pool.query("SELECT Users.userID, Users.name FROM Users JOIN Tutors ON Users.userID = Tutors.userID WHERE Tutors.subjects LIKE ?", [`%${subject}%`]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch tutors" });
    }
};

exports.getTutorAvailability = async (req, res) => {
    const pool = require('../config/db');
    const userID = req.params.userID;
    try {
        const [rows] = await pool.query("SELECT availability FROM Tutors WHERE userID = ?", [userID]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch availability" });
    }
};

exports.getStudentIDByUserID = async (req, res) => {
    const pool = require('../config/db');
    const { userID } = req.params;
    try {
        const [rows] = await pool.query('SELECT studentID FROM Students WHERE userID = ?', [userID]);
        if (rows.length > 0) res.json(rows[0]);
        else res.status(404).json({ error: "Student not found" });
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch studentID" });
    }
};

exports.getAllStudents = async (req, res) => {
    const pool = require('../config/db');
    try {
        await pool.query(`UPDATE Students s JOIN Users u ON s.userID = u.userID SET s.status = 'Inactive' WHERE u.lastLogin IS NULL OR u.lastLogin < (NOW() - INTERVAL 3 DAY)`);
        const [rows] = await pool.query('SELECT * FROM Students');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch students" });
    }
};

exports.updateLastLogin = async (userID) => {
    const pool = require('../config/db');
    try {
        await pool.query("UPDATE Users SET lastLogin = NOW() WHERE userID = ?", [userID]);
    } catch (err) {
        console.error("Error updating last login:", err);
    }
};

exports.addStaff = async (req, res) => {
    const pool = require('../config/db');
    try {
        let imageUrl = null;
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path, { folder: "staff_profiles" });
            imageUrl = result.secure_url;
        }
        await pool.query("INSERT INTO Users (name, email, password, role, image, bio, subjects, qualifications, availability, fee_per_hour, experience) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [req.body.name, req.body.email, req.body.password, req.body.role, imageUrl, req.body.bio, req.body.subjects, req.body.qualifications, req.body.availability, req.body.fee_per_hour, req.body.experience]);
        res.status(201).json({ message: "Staff member added!" });
    } catch (err) {
        res.status(500).json({ error: "Error adding staff" });
    }
};
