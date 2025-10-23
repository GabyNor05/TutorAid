const nodemailer = require('nodemailer'); // For sending emails
const pool = require('../config/db');

exports.createLesson = async (req, res) => {
  const { tutorID, studentID, subject, date, startTime, duration, total_fee } = req.body;

  if (!tutorID || !studentID || !subject || !date || !startTime || !duration) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  let conn;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();

    // Try insert with total_fee; if column missing, retry without it
    let lessonID;
    try {
      const [r] = await conn.query(
        `INSERT INTO lessons (tutorID, studentID, subject, date, startTime, duration, total_fee)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [tutorID, studentID, subject, date, startTime, duration, total_fee ?? null]
      );
      lessonID = r.insertId;
    } catch (e) {
      if (e.code === 'ER_BAD_FIELD_ERROR') {
        const [r2] = await conn.query(
          `INSERT INTO lessons (tutorID, studentID, subject, date, startTime, duration)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [tutorID, studentID, subject, date, startTime, duration]
        );
        lessonID = r2.insertId;
      } else {
        throw e;
      }
    }

    // Build message (Lesson Request)
    const [studentRows] = await conn.query(
      `SELECT u.name AS studentName
       FROM students s JOIN users u ON s.userID = u.userID
       WHERE s.studentID = ? LIMIT 1`,
      [studentID]
    );
    const studentName = studentRows?.[0]?.studentName || 'Student';
    const subjectLine = `${studentName} requested a lesson`;
    const body = [
      `Subject: ${subject}`,
      `Date: ${date}`,
      `Start Time: ${startTime}`,
      `Duration: ${duration} minutes`,
      total_fee != null ? `Total Fee: R ${Number(total_fee).toFixed(2)}` : null,
      `Lesson ID: ${lessonID}`,
    ].filter(Boolean).join('\n');

    // Insert message; fallback if "type" column missing
    try {
      await conn.query(
        `INSERT INTO messages (senderID, receiverID, subject, body, type)
         VALUES (?, ?, ?, ?, ?)`,
        [studentID, tutorID, subjectLine, body, 'Lesson Request']
      );
    } catch (e) {
      if (e.code === 'ER_BAD_FIELD_ERROR') {
        await conn.query(
          `INSERT INTO messages (senderID, receiverID, subject, body)
           VALUES (?, ?, ?, ?)`,
          [studentID, tutorID, subjectLine, body]
        );
      } else {
        throw e;
      }
    }

    await conn.commit();
    res.status(201).json({ success: true, lessonID });
  } catch (err) {
    if (conn) { try { await conn.rollback(); } catch (_) {} }
    console.error('createLesson error:', err.code, err.sqlMessage || err.message);
    res.status(500).json({ error: 'Failed to create lesson' });
  } finally {
    if (conn) conn.release();
  }
};

// Example controller for GET /api/lessons
exports.getLessonsForTutor = async (req, res) => {
    const pool = require('../config/db');
    const tutorID = req.query.tutorID;
    try {
        const [rows] = await pool.query(
            `SELECT l.lessonID, l.status, u.name AS studentName, u.image AS studentImage, l.total_fee,l.date, l.startTime, l.endTime, l.subject, s.address
             FROM lessons l
             LEFT JOIN students s ON l.studentID = s.studentID
             LEFT JOIN users u ON s.userID = u.userID
             WHERE l.tutorID = ?`,
            [tutorID]
        );
        console.log("lessons fetched:", rows);
        res.json(rows);
    } catch (err) {
        console.error("Error fetching lessons:", err);
        res.status(500).json({ error: "Failed to fetch lessons" });
    }
};

exports.updateLessonStatus = async (req, res) => {
    const pool = require('../config/db');
    const { lessonID, status } = req.body;
    try {
        await pool.query(
            `UPDATE lessons SET status = ? WHERE lessonID = ?`,
            [status, lessonID]
        );
        res.json({ message: "Lesson status updated!" });
    } catch (err) {
        res.status(500).json({ error: "Failed to update lesson status" });
    }
};

exports.deleteLesson = async (req, res) => {
    const pool = require('../config/db');
    const { lessonID, studentEmail } = req.body;
    try {
        await pool.query(`DELETE FROM lessons WHERE lessonID = ?`, [lessonID]);
        // Send cancellation email
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: studentEmail,
            subject: "Lesson Cancelled",
            text: "Your lesson has been cancelled by the tutor."
        });
        res.json({ message: "Lesson deleted and email sent!" });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete lesson" });
    }
};

exports.getAcceptedLessons = async (req, res) => {
  const pool = require('../config/db');
  const { userID, role } = req.query;

  try {
    if (role === "Student") {
      const [studentRows] = await pool.query(
        "SELECT studentID FROM students WHERE userID = ?",
        [userID]
      );
      if (studentRows.length === 0) return res.json([]);

      const studentID = studentRows[0].studentID;
      const [rows] = await pool.query(
        `
        SELECT l.*, u.name AS tutorName, u.image AS tutorImage, s.address AS address
        FROM lessons l
        JOIN tutors t ON l.tutorID = t.tutorID
        JOIN students s ON l.studentID = s.studentID
        JOIN users u ON t.userID = u.userID
        WHERE l.studentID = ? AND l.status = 'accepted'
        ORDER BY l.date ASC
        `,
        [studentID]
      );
      return res.json(rows);
    }

    if (role === "Tutor") {
      // map userID -> tutorID first
      const [trows] = await pool.query(
        "SELECT tutorID FROM tutors WHERE userID = ? LIMIT 1",
        [userID]
      );
      if (!trows.length) return res.json([]);
      const tutorID = trows[0].tutorID;

      const [rows] = await pool.query(
        `
        SELECT l.*, u.name AS studentName, u.image AS studentImage, s.address AS address
        FROM lessons l
        JOIN students s ON l.studentID = s.studentID
        JOIN users u ON s.userID = u.userID
        WHERE l.tutorID = ? AND l.status = 'accepted'
        ORDER BY l.date ASC
        `,
        [tutorID]
      );
      return res.json(rows);
    }

    return res.json([]);
  } catch (err) {
    console.error("Failed to fetch accepted lessons:", err);
    res.status(500).json({ error: "Failed to fetch accepted lessons" });
  }
};