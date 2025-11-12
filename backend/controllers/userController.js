const fs = require('fs');
const bcrypt = require('bcryptjs');
const { Resend } = require('resend');
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

// Upload image from Multer (supports memoryStorage and disk)
async function uploadImageIfAny(req) {
  const file = req.file;
  if (!file) return null;

  const cfg = cloudinary.config();
  if (!cfg.cloud_name || !cfg.api_key || !cfg.api_secret) {
    console.warn('[cloudinary] missing config; skipping upload');
    return null;
  }

  // If using memoryStorage -> use upload_stream on buffer
  if (file.buffer && !file.path) {
    return await new Promise((resolve) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'tutoraid/users', resource_type: 'image' },
        (err, result) => {
          if (err) {
            console.error('[cloudinary] upload_stream failed:', err?.message || err);
            return resolve(null);
          }
          resolve(result?.secure_url || result?.url || null);
        }
      );
      stream.end(file.buffer);
    });
  }

  // If using disk storage -> upload by path
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
    try { if (file.path) fs.unlinkSync(file.path); } catch {}
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

// Helper: set lastLogin and activate student on login
async function setLastLoginAndActivate(userID, role) {
  try {
    await pool.query('UPDATE users SET lastLogin = NOW() WHERE userID = ?', [userID]);
    if (role === 'Student') {
      await pool.query(`UPDATE students SET status = 'Active' WHERE userID = ?`, [userID]);
    }
  } catch (e) {
    console.warn('[lastLogin] update failed:', e?.message || e);
  }
}

// Helper: mark students Inactive if lastLogin > 3 months (bulk)
async function enforceInactiveByLastLoginAll() {
  try {
    await pool.query(`
      UPDATE students s
      JOIN users u ON s.userID = u.userID
      SET s.status = 'Inactive'
      WHERE (u.lastLogin IS NULL OR u.lastLogin < DATE_SUB(NOW(), INTERVAL 3 MONTH))
        AND s.status <> 'Inactive'
    `);
  } catch (e) {
    console.warn('[inactive-enforce:all] failed:', e?.message || e);
  }
}

// Helper: mark a specific student Inactive if lastLogin > 3 months
async function enforceInactiveByLastLoginForUser(userID) {
  try {
    await pool.query(`
      UPDATE students s
      JOIN users u ON s.userID = u.userID
      SET s.status = 'Inactive'
      WHERE s.userID = ?
        AND (u.lastLogin IS NULL OR u.lastLogin < DATE_SUB(NOW(), INTERVAL 3 MONTH))
        AND s.status <> 'Inactive'
    `, [userID]);
  } catch (e) {
    console.warn('[inactive-enforce:user] failed:', e?.message || e);
  }
}

// ---------------- Users CRUD ----------------

exports.getAllUsers = async (_req, res) => {
  try {
    await enforceInactiveByLastLoginAll(); // ADD: keep statuses in sync
    const rows = await userModel.getAllUsers();
    res.json(rows);
  } catch (err) {
    return sendError(res, err, 500, 'Failed to fetch users');
  }
};

// Alias used by some code
exports.getUsers = exports.getUsers || exports.getAllUsers;

exports.getUser = async (req, res) => {
  try {
    const user = await userModel.getUserById(req.params.id);
    if (!user) return res.status(404).send('User not found');
    try {
      await enforceInactiveByLastLoginForUser(req.params.id); // ADD: sync single user
      const [s] = await pool.query('SELECT studentID, status FROM students WHERE userID = ?', [req.params.id]);
      if (s[0]) user.studentID = s[0].studentID, user.status = s[0].status || user.status;
    } catch {}
    res.json(user);
  } catch (err) {
    return sendError(res, err, 500, 'Failed to fetch user');
  }
};

exports.createUser = async (req, res) => {
  try {
    const body = req.body || {}; // GUARD
    const { name, email, password, role = '' } = body;
    if (!name || !email || !password) {
      return res.status(400).send('name, email, password required');
    }

    const [existing] = await pool.query('SELECT userID FROM users WHERE email = ? LIMIT 1', [email]);
    if (existing.length) return res.status(409).send('Email already registered');

    const hashed = await bcrypt.hash(password, 10);
    const imageUrl = await uploadImageIfAny?.(req)?.catch?.(() => null) || null; // safe call

    const [result] = await pool.query(
      'INSERT INTO users (image, name, email, password, role) VALUES (?, ?, ?, ?, ?)',
      [imageUrl, name, email, hashed, role]
    );
    return res.status(201).json({ userID: result.insertId });
  } catch (err) {
    console.error('[createUser] error:', err);
    return res.status(500).send(err.sqlMessage || err.message || 'Failed to create user');
  }
};

exports.updateUser = async (req, res) => {
  const { id } = req.params;
  try {
    const imageUrl = await uploadImageIfAny?.(req)?.catch?.(() => null) || null;
    const body = req.body || {}; // GUARD
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
    await pool.query(`UPDATE users SET ${fields.join(', ')} WHERE userID = ?`, values);
    const [rows] = await pool.query('SELECT * FROM users WHERE userID = ?', [id]);
    return res.json(rows[0] || {});
  } catch (err) {
    console.error('[updateUser] error:', err);
    return res.status(500).send(err.sqlMessage || err.message || 'Failed to update user');
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await userModel.deleteUser(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    return sendError(res, err, 500, 'Failed to delete user');
  }
};

// ---------------- Auth ----------------

exports.loginUser = async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).send('email and password required');
  try {
    const user = await userModel.getUserByEmail(email);
    if (!user) return res.status(401).send('Invalid credentials');

    const ok = await bcrypt.compare(password, user.password || '');
    if (!ok) return res.status(401).send('Invalid credentials');

    // ADD: update lastLogin and activate student
    await setLastLoginAndActivate(user.userID, user.role);

    let status = null, studentID = null;
    if (user.role === 'Student') {
      // Ensure status reflects lastLogin policy
      await enforceInactiveByLastLoginForUser(user.userID);
      const [s] = await pool.query('SELECT studentID, status FROM students WHERE userID = ?', [user.userID]);
      if (s[0]) { studentID = s[0].studentID; status = s[0].status || null; }
    }
    res.json({ userID: user.userID, role: user.role, status, studentID });
  } catch (err) {
    return sendError(res, err, 500, 'Login failed');
  }
};

exports.login = async (req, res) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');
    if (!email || !password) return res.status(400).send('Email and password are required');

    const [[user]] = await pool.query(
      'SELECT userID, email, password, role, name FROM users WHERE LOWER(email) = ? LIMIT 1',
      [email]
    );
    if (!user) return res.status(401).send('Invalid email or password');

    const hash = user.password || '';
    let ok = false;
    if (hash && hash.startsWith('$2')) ok = await bcrypt.compare(password, hash);
    else ok = password === hash;
    if (!ok) return res.status(401).send('Invalid email or password');

    // ADD: update lastLogin and activate student
    await setLastLoginAndActivate(user.userID, user.role);

    let student = null;
    if (user.role === 'Student') {
      await enforceInactiveByLastLoginForUser(user.userID); // ensure policy
      const [[row]] = await pool.query(
        'SELECT studentID, status FROM students WHERE userID = ? LIMIT 1',
        [user.userID]
      );
      if (row) student = row;
    }
    res.json({ userID: user.userID, role: user.role, name: user.name, student });
  } catch (err) {
    return sendError(res, err, 500, 'Login failed');
  }
};

// ---------------- OTP ----------------

exports.sendOtp = async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email) return res.status(400).send('email required');

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    otpStore[email] = { otp, createdAt: Date.now() };

    const result = await sendEmail({
      to: email,
      subject: 'Tutor Aid - Verification OTP',
      text: `Please use the One Time Pin(OTP) below to verify your account.\n\n${otp}\n\nThis OTP is valid for 1 minutes.`,
    });

    // Success remains JSON
    const payload = { success: true, delivered: !!result.ok };
    if (!result.ok && process.env.NODE_ENV !== 'production') payload.reason = result.reason;
    return res.json(payload);
  } catch (err) {
    return sendError(res, err, 500, 'Failed to send OTP');
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body || {};
    if (!email || !otp) return res.status(400).send('email and otp required');
    const rec = otpStore[email];
    if (!rec) return res.status(400).send('No OTP requested for this email');
    if (Date.now() - rec.createdAt > 60_000) return res.status(400).send('OTP expired');
    if (rec.otp !== otp) return res.status(400).send('Invalid OTP');
    delete otpStore[email];
    res.json({ success: true });
  } catch (err) {
    return sendError(res, err, 500, 'Failed to verify OTP');
  }
};

// Email health (kept JSON)
exports.emailHealth = async (_req, res) => {
  if (!process.env.RESEND_API_KEY) return res.json({ ok: false, reason: 'No RESEND_API_KEY' });
  return res.json({ ok: true, provider: 'resend' });
};

// SMTP TCP check (kept JSON)
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
    return sendError(res, err, 500, 'Failed to fetch tutors');
  }
};

exports.getTutorAvailability = async (req, res) => {
  try {
    const { userID } = req.params;
    const [rows] = await pool.query('SELECT availability FROM tutors WHERE userID = ?', [userID]);
    if (!rows.length) return res.status(404).send('Tutor not found');
    res.json({ availability: rows[0].availability || '' });
  } catch (err) {
    return sendError(res, err, 500, 'Failed to fetch availability');
  }
};

exports.getStudentIDByUserID = async (req, res) => {
  try {
    const { userID } = req.params;
    const [rows] = await pool.query('SELECT studentID FROM students WHERE userID = ?', [userID]);
    if (!rows.length) return res.status(404).send('Student not found');
    res.json({ studentID: rows[0].studentID });
  } catch (err) {
    return sendError(res, err, 500, 'Failed to fetch studentID');
  }
};

exports.addStaff = async (req, res) => {
  try {
    const {
      name, email, password, role = 'Admin',
      bio = '', subjects = '', qualifications = '', availability = '',
      fee_per_hour = 0, experience = ''
    } = req.body;

    if (!name || !email || !password) return res.status(400).send('name, email, password required');

    const [exists] = await pool.query('SELECT userID FROM users WHERE email = ?', [email]);
    if (exists.length) return res.status(409).send('Email already registered');

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
    return sendError(res, err, 500, 'Failed to add staff');
  }
};

exports.assignRole = async (req, res) => {
  const { id } = req.params;
  const {
    role,
    bio = '', subjects = '', qualifications = '', availability = '',
    fee_per_hour = 0, experience = '',
  } = req.body || {};
  if (!role) return res.status(400).send('role required');

  try {
    await pool.query('UPDATE users SET role = ? WHERE userID = ?', [role, id]);

    if (role === 'Tutor') {
      const [t] = await pool.query('SELECT userID FROM tutors WHERE userID = ?', [id]);
      if (!t.length) {
        await pool.query(
          `INSERT INTO tutors (userID, bio, subjects, qualifications, availability, fee_per_hour, experience)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [id, bio, subjects, qualifications, availability, fee_per_hour ?? 0, experience]
        );
      } else {
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
    return sendError(res, err, 500, 'Failed to assign role');
  }
};

exports.changeStatus = async (req, res) => {
  const { userID, newStatus, adminPassword } = req.body || {};
  if (adminPassword !== process.env.ADMIN_PASSWORD) {
    return res.status(401).send('Incorrect admin password.');
  }
  if (!userID || !newStatus) return res.status(400).send('userID and newStatus required.');

  try {
    const [studentRows] = await pool.query('SELECT studentID FROM students WHERE userID = ?', [userID]);
    if (!studentRows.length) return res.status(404).send('Student not found.');

    const studentID = studentRows[0].studentID;
    const [result] = await pool.query('UPDATE students SET status = ? WHERE studentID = ?', [newStatus, studentID]);
    if (result.affectedRows === 0) return res.status(404).send('Student not found.');

    res.json({ success: true });
  } catch (err) {
    return sendError(res, err, 500, 'Error updating status.');
  }
};

exports.removeUser = async (req, res) => {
  const { userID, adminPassword } = req.body || {};
  if (adminPassword !== process.env.ADMIN_PASSWORD) {
    return res.status(401).send('Incorrect admin password.');
  }
  if (!userID) return res.status(400).send('userID required.');

  let conn;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();

    const uid = Number(userID);

    // If user is a Student, delete dependent rows referencing students(studentID)
    const [sRows] = await conn.query('SELECT studentID FROM students WHERE userID = ?', [uid]);
    const studentIDs = sRows.map(r => r.studentID);

    if (studentIDs.length) {
      // Best-effort deletes; ignore if table doesn’t exist
      await conn.query('DELETE FROM lessonreports WHERE studentID IN (?)', [studentIDs]).catch(() => {});
      await conn.query('DELETE FROM progress_notes WHERE studentID IN (?)', [studentIDs]).catch(() => {});
      await conn.query('DELETE FROM lessons WHERE studentID IN (?)', [studentIDs]).catch(() => {});
      // Add more student-dependent tables here if needed
      await conn.query('DELETE FROM students WHERE studentID IN (?)', [studentIDs]);
    } else {
      await conn.query('DELETE FROM students WHERE userID = ?', [uid]).catch(() => {});
    }

    // If user is a Tutor, clean up tutor-dependent rows
    const [tRows] = await conn.query('SELECT tutorID FROM tutors WHERE userID = ?', [uid]);
    const tutorIDs = tRows.map(r => r.tutorID);

    if (tutorIDs.length) {
      await conn.query('DELETE FROM lessons WHERE tutorID IN (?)', [tutorIDs]).catch(() => {});
      await conn.query('DELETE FROM tutors WHERE tutorID IN (?)', [tutorIDs]);
    } else {
      await conn.query('DELETE FROM tutors WHERE userID = ?', [uid]).catch(() => {});
    }

    // Admin record (if present)
    await conn.query('DELETE FROM admins WHERE userID = ?', [uid]).catch(() => {});

    // Finally delete the user
    const [result] = await conn.query('DELETE FROM users WHERE userID = ?', [uid]);
    if (result.affectedRows === 0) {
      await conn.rollback();
      return res.status(404).send('User not found.');
    }

    await conn.commit();
    return res.json({ success: true });
  } catch (err) {
    if (conn) { try { await conn.rollback(); } catch {} }
    return sendError(res, err, 500, 'Error removing user.');
  } finally {
    if (conn) conn.release();
  }
};

// Forgot password (OTP)
exports.forgotPasswordRequest = async (req, res) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    if (!email) return res.status(400).send('email required');

    const [[user]] = await pool.query(
      'SELECT userID, email FROM users WHERE LOWER(email) = ? LIMIT 1',
      [email]
    );

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
    return sendError(res, err, 500, 'Failed to process request');
  }
};

exports.forgotPasswordVerify = async (req, res) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const otp = String(req.body?.otp || '');
    if (!email || !otp) return res.status(400).send('email and otp required');

    const rec = otpStore[email];
    if (!rec) return res.status(400).send('No OTP requested for this email');
    if (Date.now() - rec.createdAt > 60_000) return res.status(400).send('OTP expired');
    if (rec.otp !== otp) return res.status(400).send('Invalid OTP');

    const userID = rec.userID;
    delete otpStore[email];
    return res.json({ ok: true, userID });
  } catch (err) {
    return sendError(res, err, 500, 'Failed to verify OTP');
  }
};

exports.resetPasswordByUserID = async (req, res) => {
  try {
    const { id } = req.params;
    const newPassword = String(req.body?.newPassword || '');
    if (!id || !newPassword) return res.status(400).send('userID and newPassword required');

    const hashed = await bcrypt.hash(newPassword, 10);
    const [result] = await pool.query('UPDATE users SET password = ? WHERE userID = ?', [hashed, id]);
    if (result.affectedRows === 0) return res.status(404).send('User not found');

    return res.json({ ok: true });
  } catch (err) {
    return sendError(res, err, 500, 'Failed to reset password');
  }
};

exports.userAvatars = async (req, res) => {
  try {
    const { studentIDs } = req.body || {};
    if (!Array.isArray(studentIDs) || !studentIDs.length) return res.json({});
    const [rows] = await pool.query(
      `SELECT s.studentID, s.userID, u.image, u.name
       FROM students s
       JOIN users u ON s.userID = u.userID
       WHERE s.studentID IN (?)`,
      [studentIDs]
    );
    const map = {};
    rows.forEach(r => {
      map[r.studentID] = {
        userID: r.userID,
        image: r.image,
        name: r.name
      };
    });
    res.json(map);
  } catch (err) {
    console.error('[userAvatars] error:', err);
    res.status(500).send(err.sqlMessage || err.message);
  }
};

// Add: uniform error helpers
function errorMessage(err, fallback = 'An error occurred') {
  return (err && (err.sqlMessage || err.message)) || fallback;
}
function sendError(res, err, status = 500, fallback) {
  console.error('[userController] error:', {
    code: err?.code,
    sqlState: err?.sqlState,
    sqlMessage: err?.sqlMessage,
    message: err?.message,
    stack: err?.stack,
  });
  return res.status(status).send(errorMessage(err, fallback));
}
