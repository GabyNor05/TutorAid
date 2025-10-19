const userModel = require('../models/userModel');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const net = require('net');

// Replace makeTransporter to read env and use sensible defaults
function makeTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT || 465);      // try 465 first
  const secure = (process.env.SMTP_SECURE || 'true') === 'true'; // true for 465, false for 587
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  return nodemailer.createTransport({
    host, port, secure,
    auth: user && pass ? { user, pass } : undefined,
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
    tls: { rejectUnauthorized: false },
  });
}

// Primary: send via SMTP; Fallback: Resend HTTP API
async function sendEmail({ to, subject, text }) {
  // Try SMTP if configured
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    try {
      const t = makeTransporter();
      await t.verify();
      await t.sendMail({
        from: `"TutorAid" <${process.env.EMAIL_USER}>`,
        to, subject, text,
      });
      return { via: 'smtp' };
    } catch (e) {
      console.error('SMTP send failed:', e.code || e.name, e.message);
    }
  }
  // Fallback to Resend API if key present
  if (process.env.RESEND_API_KEY) {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM || 'TutorAid <onboarding@resend.dev>',
        to, subject, text,
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`Resend ${res.status}: ${body}`);
    }
    return { via: 'resend' };
  }
  throw new Error('No email provider configured');
}

async function sendWithResend(to, subject, text) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY not set');
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM || 'TutorAid <onboarding@resend.dev>',
      to,
      subject,
      text,
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Resend ${res.status}: ${body}`);
  }
}

const otpStore = {}; // { email: otp }

// GET all users
exports.getUsers = async (req, res) => {
    const pool = require('../config/db');
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
      SELECT u.*, s.status
      FROM users u
      LEFT JOIN Students s ON u.userID = s.userID
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

// // GET single user by ID
exports.getUser = async (req, res) => {
    const pool = require('../config/db');
    try {
        const user = await userModel.getUserById(req.params.id);
        if (!user) return res.status(404).json({ error: "User not found" });
        
        // Fetch studentID if user is a student
        if (user.role === "Student") {
          const [studentRows] = await pool.query("SELECT studentID FROM students WHERE userID = ?", [user.userID]);
          if (studentRows.length) {
            user.studentID = studentRows[0].studentID;
          }
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// CREATE new user without role-specific data
const pool = require('../config/db');        // ok to keep (or require inside functions)
async function uploadImageIfAny(req){ return null; }

exports.createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'name, email and password are required' });
    }

    // unique email
    const [existing] = await pool.query('SELECT userID FROM users WHERE email = ?', [email]);
    if (existing.length) return res.status(409).json({ error: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);
    const imageUrl = await uploadImageIfAny(req); // null if no file

    // role empty by design; funFact optional
    const [result] = await pool.query(
      `INSERT INTO users (name, email, password, role, image, funFact)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, email, hashed, '', imageUrl, req.body.funFact || null]
    );

    return res.status(201).json({ userID: result.insertId });
  } catch (err) {
    console.error('createUser error:', err);
    return res.status(500).json({ error: 'Failed to create user' });
  }
};

// UPDATE existing user
exports.updateUser = async (req, res) => {
    const pool = require('../config/db');
    try {
        let imageUrl;
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: "uploads"
            });
            imageUrl = result.secure_url;
            fs.unlinkSync(req.file.path);
        }

        // Build update object for users table
        const updateData = { ...req.body };
        if (imageUrl) updateData.image = imageUrl;

        await userModel.updateUser(req.params.id, updateData);

        // If student fields are present, update Students table
        if (
            updateData.grade !== undefined ||
            updateData.school !== undefined ||
            updateData.address !== undefined ||
            updateData.status !== undefined
        ) {
            await userModel.updateStudent(req.params.id, {
                grade: updateData.grade,
                school: updateData.school,
                address: updateData.address,
                status: updateData.status
            });
        }

        // Optionally fetch updated user and return
        const updatedUser = await userModel.getUserById(req.params.id);
        res.json(updatedUser);
    } catch (err) {
        console.error("Error in updateUser:", err);
        res.status(500).json({ error: err.message });
    }
};

// DELETE user
exports.deleteUser = async (req, res) => {
    const pool = require('../config/db');
    try {
        await userModel.deleteUser(req.params.id);
        res.json({ message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// test
exports.createTestUser = async (req, res) => {
    const pool = require('../config/db');
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
        res.json(createdUser);
    } catch (err) {
        console.error("Error creating test user:", err);
        res.status(500).json({ error: err.message });
    }
};

exports.loginUser = async (req, res) => {
    const pool = require('../config/db');
    const { email, password } = req.body;
    try {
        const user = await userModel.getUserByEmail(email);
        if (!user) {
            return res.status(401).json({ error: "Invalid email or password" });
        }
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ error: "Invalid email or password" });
        }
        // Update lastLogin for all users
        await pool.query(
          "UPDATE users SET lastLogin = NOW() WHERE userID = ?",
          [user.userID]
        );

        // Get student record if user is a student
        let student = null;
        if (user.role === "Student") {
            const [studentRows] = await pool.query("SELECT * FROM students WHERE userID = ?", [user.userID]);
            if (studentRows.length) {
                student = studentRows[0];
                if (student.status === "Blocked") {
                    // Do NOT allow login, return blocked status AND studentID
                    return res.json({ userID: user.userID, student: { studentID: student.studentID, status: "Blocked" } });
                }
                if (student.status === "Inactive") {
                    // Reactivate student
                    await pool.query("UPDATE students SET status = 'Active' WHERE studentID = ?", [student.studentID]);
                    student.status = "Active";
                }
            }
        }

        if (student) {
            return res.json({ userID: user.userID, student });
        }
        // For admin/tutor
        res.json({ userID: user.userID, name: user.name, email: user.email, role: user.role });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
};

// Keep your sendWithResend helper (uses global fetch on Node 18+)

// Replace sendOtp and emailHealth with these:

exports.sendOtp = async (req, res) => {
  const { email } = req.body;
  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[email] = { otp, createdAt: Date.now() };

    if (process.env.ALLOW_DEBUG_OTP === 'true') {
      console.log('[OTP][DEV]', email, otp);
      return res.json({ message: 'OTP sent (dev mode)', otp });
    }

    await sendWithResend(email, 'Your OTP Code', `Your OTP is: ${otp}`);
    res.json({ message: 'OTP sent' });
  } catch (err) {
    console.error('Error sending OTP:', err.message);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
};

exports.emailHealth = async (_req, res) => {
  try {
    if (!process.env.RESEND_API_KEY) {
      return res.status(500).json({ ok: false, message: 'RESEND_API_KEY not set' });
    }
    const to = process.env.EMAIL_TEST_TO || process.env.EMAIL_USER;
    if (!to) {
      return res.status(400).json({ ok: false, message: 'Set EMAIL_TEST_TO to run this check' });
    }
    await sendWithResend(to, 'TutorAid Email Health', 'Health check via Resend.');
    res.json({ ok: true, via: 'resend' });
  } catch (e) {
    res.status(500).json({ ok: false, message: e.message });
  }
};

exports.verifyOtp = async (req, res) => {
    const pool = require('../config/db');
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ error: "Missing email or OTP" });
  }
  const record = otpStore[email];
  if (!record) {
    return res.status(400).json({ error: "Invalid OTP" });
  }
  
    // Check if OTP is expired (5 minutes = 300000 ms) for demo purposes, set to 1 minute (60000 ms)
    if (Date.now() - record.createdAt > 60000) {
        delete otpStore[email];
        return res.status(400).json({ error: "OTP expired" });
    }

    if (record.otp === otp) {
        delete otpStore[email]; // Clear OTP after success
        return res.json({ success: true });
    }
    return res.status(400).json({ error: "Invalid OTP" });
};


exports.getTutorsBySubject = async (req, res) => {
    const pool = require('../config/db');
    const subject = req.params.subject;
    try {
        
        const [rows] = await pool.query(
            "SELECT users.userID, users.name FROM users JOIN tutors ON users.userID = tutors.userID WHERE tutors.subjects LIKE ?",
            [`%${subject}%`]
        );
        res.json(rows);
    } catch (err) {
        console.error("Error fetching tutors:", err); 
        res.status(500).json({ error: "Failed to fetch tutors" });
    }
};

exports.getTutorAvailability = async (req, res) => {
    const pool = require('../config/db');
    const userID = req.params.userID;
    try {
        const [rows] = await pool.query(
            "SELECT availability FROM tutors WHERE userID = ?",
            [userID]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch availability" });
    }
};


exports.getStudentIDByUserID = async (req, res) => {
    const pool = require('../config/db');
    const { userID } = req.params;
    try {
        const [rows] = await pool.query(
            'SELECT studentID FROM Students WHERE userID = ?',
            [userID]
        );
        if (rows.length > 0) {
            res.json(rows[0]);
        } else {
            res.status(404).json({ error: "Student not found" });
        }
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch studentID" });
    }
};

exports.getAllStudents = async (req, res) => {
    const pool = require('../config/db');
  try {
    await pool.query(`
      UPDATE Students s
      JOIN users u ON s.userID = u.userID
      SET s.status = 'Inactive'
      WHERE u.lastLogin IS NULL OR u.lastLogin < (NOW() - INTERVAL 3 DAY)
    `);
    const [rows] = await pool.query('SELECT * FROM Students');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch students" });
  }
};

exports.updateLastLogin = async (userID) => {
    const pool = require('../config/db');
    try {
        await pool.query(
            "UPDATE users SET lastLogin = NOW() WHERE userID = ?",
            [user.userID]
        );
    } catch (err) {
        console.error("Error updating last login:", err);
    }
};

exports.addStaff = async (req, res) => {
    const pool = require('../config/db');
    try {
        let imageUrl = null;
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: "staff_profiles"
            });
            imageUrl = result.secure_url;
        }
        // Save imageUrl to DB (not req.file.path)
        await pool.query(
            "INSERT INTO users (name, email, password, role, image, bio, subjects, qualifications, availability, fee_per_hour, experience) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [req.body.name, req.body.email, req.body.password, req.body.role, imageUrl, req.body.bio, req.body.subjects, req.body.qualifications, req.body.availability, req.body.fee_per_hour, req.body.experience]
        );
        res.status(201).json({ message: "Staff member added!" });
    } catch (err) {
        res.status(500).json({ error: "Error adding staff" });
    }
};

// TCP check (forces IPv4) and supports ?port= override for quick tests
exports.smtpTcpCheck = async (req, res) => {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(req.query.port || process.env.SMTP_PORT || 465);
  const socket = new net.Socket();
  let done = false;
  const end = (status, info) => {
    if (done) return; done = true;
    try { socket.destroy(); } catch {}
    res.status(status).json(info);
  };
  socket.setTimeout(8000);
  socket.on('connect', () => end(200, { ok: true, host, port }));
  socket.on('timeout', () => end(504, { ok: false, host, port, error: 'timeout' }));
  socket.on('error', (err) => end(502, { ok: false, host, port, error: err.code || err.message }));
  socket.connect({ host, port, family: 4 });
};

// Assign a role AFTER signup and create role-specific row if missing
exports.assignRole = async (req, res) => {
  const pool = require('../config/db');
  const { id } = req.params;
  const { role } = req.body;

  try {
    if (!role || !['Student', 'Tutor'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Use "Student" or "Tutor".' });
    }

    // Ensure user exists
    const [u] = await pool.query('SELECT * FROM users WHERE userID = ?', [id]);
    if (!u.length) return res.status(404).json({ error: 'User not found' });

    // Update users.role
    await pool.query('UPDATE users SET role = ? WHERE userID = ?', [role, id]);

    if (role === 'Student') {
      // Create student row if not exists
      const [s] = await pool.query('SELECT studentID FROM students WHERE userID = ?', [id]);
      if (!s.length) {
        await pool.query(
          'INSERT INTO students (userID, grade, school, address, status) VALUES (?, ?, ?, ?, ?)',
          [id, '', '', '', 'Active']
        );
      }
    } else if (role === 'Tutor') {
      // Create tutor row if not exists
      const [t] = await pool.query('SELECT userID FROM tutors WHERE userID = ?', [id]);
      if (!t.length) {
        await pool.query(
          'INSERT INTO tutors (userID, bio, subjects, qualifications, availability) VALUES (?, ?, ?, ?, ?)',
          [id, '', '', '', '']
        );
      }
    }

    res.json({ ok: true, userID: Number(id), role });
  } catch (err) {
    console.error('assignRole error:', err);
    res.status(500).json({ error: 'Failed to assign role' });
  }
};
