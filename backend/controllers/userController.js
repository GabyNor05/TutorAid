const fs = require('fs');
const net = require('net');
const bcrypt = require('bcryptjs');
const { Resend } = require('resend');       // ADD
const cloudinary = require('cloudinary').v2;
const pool = require('../config/db');
const userModel = require('../models/userModel');

const resend = new Resend(process.env.RESEND_API_KEY || '');

// Cloudinary config (env must be set on Render)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
});

// Upload a disk file (multer dest) to Cloudinary and return secure URL
async function uploadImageIfAny(req) {
  const file = req.file;
  if (!file) return null;

  const cfg = cloudinary.config();
  if (!cfg.cloud_name || !cfg.api_key || !cfg.api_secret) {
    console.warn('[cloudinary] missing config; skipping upload');
    try { fs.unlinkSync(file.path); } catch {}
    return null;
  }
  try {
    const up = await cloudinary.uploader.upload(file.path, {
      folder: 'tutoraid/users',
      resource_type: 'image',
    });
    return up.secure_url || up.url || null;
  } catch (e) {
    console.error('[cloudinary] upload failed:', e?.message || e);
    return null;
  } finally {
    try { fs.unlinkSync(file.path); } catch {}
  }
}


async function sendEmail({ to, subject, text }) {
  if (!process.env.RESEND_API_KEY) {
    console.log('[email] RESEND_API_KEY missing; skipping send', { to, subject });
    return { ok: false, skipped: true, reason: 'no-api-key' };
  }
  // Use verified domain sender if set; otherwise fallback to Resend onboarding
  const from = process.env.RESEND_FROM || 'Tutor Aid <onboarding@resend.dev>';
  try {
    const { error } = await resend.emails.send({ from, to, subject, text });
    if (error) throw error;
    return { ok: true };
  } catch (err) {
    console.error('[resend] send failed:', err?.message || String(err), { to, from });
    return { ok: false, reason: err?.message || 'unknown' };
  }
}

// In‑memory OTP store
const otpStore = {}; // { [email]: { otp, createdAt } }

// ---------------- Users CRUD ----------------

exports.getAllUsers = async (_req, res) => {
  try {
    const rows = await userModel.getAllUsers();
    res.json(rows);
  } catch (err) {
    console.error('getAllUsers error:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// Alias used by some code
exports.getUsers = exports.getAllUsers;

exports.getUser = async (req, res) => {
  try {
    const user = await userModel.getUserById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    // add studentID for convenience if student row exists
    try {
      const [s] = await pool.query('SELECT studentID, status FROM students WHERE userID = ?', [req.params.id]);
      if (s[0]) user.studentID = s[0].studentID, user.status = s[0].status || user.status;
    } catch {}
    res.json(user);
  } catch (err) {
    console.error('getUser error:', err);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role = '' } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'name, email, password required' });
    }

    const [existing] = await pool.query('SELECT userID FROM users WHERE email = ? LIMIT 1', [email]);
    if (existing.length) return res.status(409).json({ error: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);
    const imageUrl = await uploadImageIfAny(req);

    const [result] = await pool.query(
      'INSERT INTO users (image, name, email, password, role) VALUES (?, ?, ?, ?, ?)',
      [imageUrl, name, email, hashed, role]
    );

    return res.status(201).json({ userID: result.insertId });
  } catch (err) {
    console.error('createUser error:', err);
    res.status(500).json({ error: 'Failed to create user' });
  }
};

exports.updateUser = async (req, res) => {
  const { id } = req.params;
  try {
    const imageUrl = await uploadImageIfAny(req);
    const body = req.body || {};

    const fields = [];
    const values = [];

    if (body.name !== undefined) { fields.push('name = ?'); values.push(body.name); }
    if (body.email !== undefined) { fields.push('email = ?'); values.push(body.email); }
    if (body.password !== undefined) {
      const hashed = await bcrypt.hash(body.password, 10);
      fields.push('password = ?'); values.push(hashed);
    }
    if (body.role !== undefined) { fields.push('role = ?'); values.push(body.role); }
    if (body.funFact !== undefined) { fields.push('funFact = ?'); values.push(body.funFact); }
    if (imageUrl) { fields.push('image = ?'); values.push(imageUrl); }

    if (!fields.length) {
      const [rows] = await pool.query('SELECT * FROM users WHERE userID = ?', [id]);
      return res.json(rows[0] || {});
    }

    values.push(id);
    const sql = `UPDATE users SET ${fields.join(', ')} WHERE userID = ?`;
    await pool.query(sql, values);

    const [rows] = await pool.query('SELECT * FROM users WHERE userID = ?', [id]);
    return res.json(rows[0] || {});
  } catch (err) {
    console.error('updateUser error:', {
      code: err.code,
      message: err.message,
      stack: err.stack,
    });
    return res.status(500).json({ error: 'Failed to update user', detail: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await userModel.deleteUser(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    console.error('deleteUser error:', err);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

// ---------------- Auth ----------------

exports.loginUser = async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });
  try {
    const user = await userModel.getUserByEmail(email);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.password || '');
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    // If student, include status and studentID
    let status = null, studentID = null;
    if (user.role === 'Student') {
      const [s] = await pool.query('SELECT studentID, status FROM students WHERE userID = ?', [user.userID]);
      if (s[0]) { studentID = s[0].studentID; status = s[0].status || null; }
    }

    res.json({
      userID: user.userID,
      role: user.role,
      status,
      studentID,
    });
  } catch (err) {
    console.error('loginUser error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
};

exports.login = async (req, res) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const [[user]] = await pool.query(
      'SELECT userID, email, password, role, name FROM users WHERE LOWER(email) = ? LIMIT 1',
      [email]
    );

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const hash = user.password || '';
    let ok = false;
    if (hash && hash.startsWith('$2')) {
      ok = await bcrypt.compare(password, hash);
    } else {
      // fallback for plaintext dev data
      ok = password === hash;
    }
    if (!ok) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Attach student info if applicable
    let student = null;
    if (user.role === 'Student') {
      const [[row]] = await pool.query(
        'SELECT studentID, status FROM students WHERE userID = ? LIMIT 1',
        [user.userID]
      );
      if (row) student = row;
    }

    // Success payload (kept minimal for your Login.js)
    res.json({
      userID: user.userID,
      role: user.role,
      name: user.name,
      student, // may be null
    });
  } catch (err) {
    console.error('[users/login] error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
};

// ---------------- OTP ----------------

exports.sendOtp = async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email) return res.status(400).json({ error: 'email required' });

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    otpStore[email] = { otp, createdAt: Date.now() };

    const result = await sendEmail({
      to: email,
      subject: 'Tutor Aid - Verification OTP',
      text: `Please use the One Time Pin(OTP) below to verify your account.\n\n${otp}\n\nThis OTP is valid for 1 minute.`,
    });

    // Include reason in non-production to diagnose why others don’t receive
    const payload = { success: true, delivered: !!result.ok };
    if (!result.ok && process.env.NODE_ENV !== 'production') payload.reason = result.reason;
    return res.json(payload);
  } catch (err) {
    console.error('sendOtp error:', err);
    return res.json({ success: true, delivered: false });
  }
};

exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body || {};
  if (!email || !otp) return res.status(400).json({ error: 'email and otp required' });
  const rec = otpStore[email];
  if (!rec) return res.status(400).json({ error: 'No OTP requested for this email' });
  if (Date.now() - rec.createdAt > 60_000) return res.status(400).json({ error: 'OTP expired' });
  if (rec.otp !== otp) return res.status(400).json({ error: 'Invalid OTP' });
  delete otpStore[email];
  res.json({ success: true });
};

// Email health (Resend)
exports.emailHealth = async (_req, res) => {
  if (!process.env.RESEND_API_KEY) {
    return res.json({ ok: false, reason: 'No RESEND_API_KEY' });
  }
  return res.json({ ok: true, provider: 'resend' });
};

exports.smtpTcpCheck = async (req, res) => {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(req.query.port || process.env.SMTP_PORT || 465);
  const socket = new net.Socket();
  let done = false;
  const end = (status, info) => {
    if (done) return;
    done = true;
    try { socket.destroy(); } catch {}
    res.status(status).json(info);
  };
  socket.setTimeout(8000);
  socket.on('connect', () => end(200, { ok: true, host, port }));
  socket.on('timeout', () => end(504, { ok: false, host, port, error: 'timeout' }));
  socket.on('error', (err) => end(502, { ok: false, host, port, error: err.code || err.message }));
  socket.connect({ host, port, family: 4 });
};

// ---------------- Helpers used by other pages ----------------

exports.getTutorsBySubject = async (req, res) => {
  try {
    const subject = String(req.params.subject || '').trim();
    if (!subject) return res.json([]);
    const [rows] = await pool.query(
      `SELECT t.*, u.name, u.image
       FROM tutors t
       JOIN users u ON t.userID = u.userID
       WHERE FIND_IN_SET(?, REPLACE(t.subjects, ' ', '')) OR t.subjects LIKE ?`,
      [subject, `%${subject}%`]
    );
    res.json(rows);
  } catch (err) {
    console.error('getTutorsBySubject error:', err);
    res.status(500).json({ error: 'Failed to fetch tutors' });
  }
};

exports.getTutorAvailability = async (req, res) => {
  try {
    const { userID } = req.params;
    const [rows] = await pool.query('SELECT availability FROM tutors WHERE userID = ?', [userID]);
    if (!rows.length) return res.status(404).json({ error: 'Tutor not found' });
    res.json({ availability: rows[0].availability || '' });
  } catch (err) {
    console.error('getTutorAvailability error:', err);
    res.status(500).json({ error: 'Failed to fetch availability' });
  }
};

exports.getStudentIDByUserID = async (req, res) => {
  try {
    const { userID } = req.params;
    const [rows] = await pool.query('SELECT studentID FROM students WHERE userID = ?', [userID]);
    if (!rows.length) return res.status(404).json({ error: 'Student not found' });
    res.json({ studentID: rows[0].studentID });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch studentID' });
  }
};

// Add staff (admin tool). Accepts optional image; will create role rows.
exports.addStaff = async (req, res) => {
  try {
    const {
      name, email, password, role = 'Admin',
      bio = '', subjects = '', qualifications = '', availability = '',
      fee_per_hour = 0, experience = ''
    } = req.body;

    if (!name || !email || !password) return res.status(400).json({ error: 'name, email, password required' });

    const [exists] = await pool.query('SELECT userID FROM users WHERE email = ?', [email]);
    if (exists.length) return res.status(409).json({ error: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);
    const imageUrl = await uploadImageIfAny(req);

    const [userRes] = await pool.query(
      'INSERT INTO users (image, name, email, password, role) VALUES (?, ?, ?, ?, ?)',
      [imageUrl, name, email, hashed, role]
    );
    const userID = userRes.insertId;

    if (role === 'Tutor') {
      await pool.query(
        `INSERT INTO tutors (userID, bio, subjects, qualifications, availability, fee_per_hour, experience)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [userID, bio, subjects, qualifications, availability, fee_per_hour, experience]
      );
    } else if (role === 'Student') {
      await pool.query(`INSERT INTO students (userID, status) VALUES (?, 'Active')`, [userID]);
    } else if (role === 'Admin') {
      await pool.query(`INSERT INTO admins (userID) VALUES (?)`, [userID]).catch(() => {});
    }

    res.status(201).json({ userID });
  } catch (err) {
    console.error('addStaff error:', err);
    res.status(500).json({ error: 'Failed to add staff' });
  }
};

// Assign a role after signup and create role-specific row if missing
exports.assignRole = async (req, res) => {
  const { id } = req.params;
  const {
    role,
    // Optional tutor fields from onboarding step 1
    bio = '',
    subjects = '',
    qualifications = '',
    availability = '',
    fee_per_hour = 0,
    experience = '',
  } = req.body || {};
  if (!role) return res.status(400).json({ error: 'role required' });

  try {
    await pool.query('UPDATE users SET role = ? WHERE userID = ?', [role, id]);

    if (role === 'Tutor') {
      const [t] = await pool.query('SELECT userID FROM tutors WHERE userID = ?', [id]);
      if (!t.length) {
        // Create tutor row with provided fields
        await pool.query(
          `INSERT INTO tutors (userID, bio, subjects, qualifications, availability, fee_per_hour, experience)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [id, bio, subjects, qualifications, availability, fee_per_hour ?? 0, experience]
        );
      } else {
        // Update existing row with any provided fields (keep existing if blanks)
        const [currRows] = await pool.query(
          `SELECT bio, subjects, qualifications, availability, fee_per_hour, experience
             FROM tutors WHERE userID = ? LIMIT 1`,
          [id]
        );
        const curr = currRows?.[0] || {};
        await pool.query(
          `UPDATE tutors
             SET bio = ?, subjects = ?, qualifications = ?, availability = ?, fee_per_hour = ?, experience = ?
           WHERE userID = ?`,
          [
            bio || curr.bio || '',
            subjects || curr.subjects || '',
            qualifications || curr.qualifications || '',
            availability || curr.availability || '',
            fee_per_hour ?? curr.fee_per_hour ?? 0,
            experience || curr.experience || '',
            id,
          ]
        );
      }
    } else if (role === 'Student') {
      const [s] = await pool.query('SELECT userID FROM students WHERE userID = ?', [id]);
      if (!s.length) {
        await pool.query(
          `INSERT INTO students (userID, grade, school, address, city, province, status)
           VALUES (?, NULL, NULL, NULL, NULL, NULL, 'Active')`,
          [id]
        );
      }
    } else if (role === 'Admin') {
      const [a] = await pool.query('SELECT userID FROM admins WHERE userID = ?', [id]);
      if (!a.length) await pool.query('INSERT INTO admins (userID) VALUES (?)', [id]);
    }

    res.json({ ok: true, userID: Number(id), role });
  } catch (err) {
    console.error('assignRole error:', err);
    res.status(500).json({ error: 'Failed to assign role' });
  }
};

// ---------------- Admin utilities moved from routes ----------------

// Change a student's status (Admin-protected)
exports.changeStatus = async (req, res) => {
  const { userID, newStatus, adminPassword } = req.body || {};
  if (adminPassword !== process.env.ADMIN_PASSWORD) {
    return res.json({ success: false, message: 'Incorrect admin password.' });
  }
  if (!userID || !newStatus) return res.json({ success: false, message: 'userID and newStatus required.' });

  try {
    const [studentRows] = await pool.query('SELECT studentID FROM students WHERE userID = ?', [userID]);
    if (!studentRows.length) return res.json({ success: false, message: 'Student not found.' });

    const studentID = studentRows[0].studentID;
    const [result] = await pool.query('UPDATE students SET status = ? WHERE studentID = ?', [newStatus, studentID]);
    if (result.affectedRows === 0) return res.json({ success: false, message: 'Student not found.' });

    res.json({ success: true });
  } catch (err) {
    console.error('changeStatus error:', err);
    res.status(500).json({ success: false, message: 'Error updating status.' });
  }
};

// Remove a user (Admin-protected)
exports.removeUser = async (req, res) => {
  const { userID, adminPassword } = req.body || {};
  if (adminPassword !== process.env.ADMIN_PASSWORD) {
    return res.json({ success: false, message: 'Incorrect admin password.' });
  }
  if (!userID) return res.json({ success: false, message: 'userID required.' });

  try {
    const [result] = await pool.query('DELETE FROM users WHERE userID = ?', [userID]);
    if (result.affectedRows === 0) return res.json({ success: false, message: 'User not found.' });
    res.json({ success: true });
  } catch (err) {
    console.error('removeUser error:', err);
    res.json({ success: false, message: 'Error removing user.', error: err.message });
  }
};

// Get avatars and names for a set of studentIDs
exports.userAvatars = async (req, res) => {
  const { studentIDs } = req.body || {};
  if (!Array.isArray(studentIDs) || !studentIDs.length) return res.json({});

  try {
    const [rows] = await pool.query(
      `SELECT s.studentID, u.image, u.name
       FROM students s
       JOIN users u ON s.userID = u.userID
       WHERE s.studentID IN (?)`,
      [studentIDs]
    );
    const images = {};
    rows.forEach(r => { images[r.studentID] = { image: r.image, name: r.name }; });
    res.json(images);
  } catch (err) {
    console.error('userAvatars error:', err);
    res.status(500).json({ error: 'Failed to fetch user images' });
  }
};

// Forgot password (OTP) — reuse in‑memory otpStore and resend mailer
exports.forgotPasswordRequest = async (req, res) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    if (!email) return res.status(400).json({ error: 'email required' });

    const [[user]] = await pool.query(
      'SELECT userID, email FROM users WHERE LOWER(email) = ? LIMIT 1',
      [email]
    );

    // Do not reveal if email exists; but if it does, send OTP and store userID
    if (user) {
      const otp = String(Math.floor(100000 + Math.random() * 900000));
      otpStore[email] = { otp, createdAt: Date.now(), userID: user.userID };
      await sendEmail({
        to: email,
        subject: 'Tutor Aid - Password Reset OTP',
        text: `Use this OTP to reset your password:\n\n${otp}\n\nThis OTP is valid for 1 minute.`,
      });
    }

    return res.json({ ok: true });
  } catch (err) {
    console.error('forgotPasswordRequest error:', err);
    return res.status(500).json({ error: 'Failed to process request' });
  }
};

exports.forgotPasswordVerify = async (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const otp = String(req.body?.otp || '');
  if (!email || !otp) return res.status(400).json({ error: 'email and otp required' });

  const rec = otpStore[email];
  if (!rec) return res.status(400).json({ error: 'No OTP requested for this email' });
  if (Date.now() - rec.createdAt > 60_000) return res.status(400).json({ error: 'OTP expired' });
  if (rec.otp !== otp) return res.status(400).json({ error: 'Invalid OTP' });

  const userID = rec.userID;
  delete otpStore[email]; // one-time use
  return res.json({ ok: true, userID });
};

exports.resetPasswordByUserID = async (req, res) => {
  try {
    const { id } = req.params;
    const newPassword = String(req.body?.newPassword || '');
    if (!id || !newPassword) return res.status(400).json({ error: 'userID and newPassword required' });

    const hashed = await bcrypt.hash(newPassword, 10);
    const [result] = await pool.query('UPDATE users SET password = ? WHERE userID = ?', [hashed, id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'User not found' });

    return res.json({ ok: true });
  } catch (err) {
    console.error('resetPasswordByUserID error:', err);
    return res.status(500).json({ error: 'Failed to reset password' });
  }
};
