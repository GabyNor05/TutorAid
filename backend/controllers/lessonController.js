const nodemailer = require('nodemailer'); // For sending emails
const pool = require('../config/db');

function hhmmss(t) {
  if (!t) return t;
  // Accept "HH:MM" or "HH:MM:SS"
  const m = String(t).match(/^(\d{2}):(\d{2})(?::(\d{2}))?$/);
  if (!m) return t;
  return m[3] ? t : `${m[1]}:${m[2]}:00`;
}

exports.createLesson = async (req, res) => {
  const { tutorID, studentID, subject, date, startTime, duration, total_fee } = req.body;
  console.log('[createLesson] payload:', { tutorID, studentID, subject, date, startTime, duration, total_fee });

  if (!tutorID || !studentID || !subject || !date || !startTime || !duration) {
    console.error('[createLesson] Missing required fields');
    return res.status(400).json({ error: 'Missing required fields' });
  }

  let conn;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();

    // Validate foreign keys exist
    const [[tExists]] = await conn.query(`SELECT COUNT(*) AS c FROM tutors WHERE tutorID = ?`, [tutorID]);
    const [[sExists]] = await conn.query(`SELECT COUNT(*) AS c FROM students WHERE studentID = ?`, [studentID]);
    console.log('[createLesson] FK check:', { tutorID, tutorExists: tExists.c, studentID, studentExists: sExists.c });
    if (!tExists.c) {
      await conn.rollback();
      return res.status(400).json({ error: 'Invalid tutorID' });
    }
    if (!sExists.c) {
      await conn.rollback();
      return res.status(400).json({ error: 'Invalid studentID' });
    }

    // Detect optional columns
    const [[feeCol]] = await conn.query(
      `SELECT COUNT(*) AS c FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'lessons' AND COLUMN_NAME = 'total_fee'`
    );
    const [[typeCol]] = await conn.query(
      `SELECT COUNT(*) AS c FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'messages' AND COLUMN_NAME = 'type'`
    );
    console.log('[createLesson] columns:', { lessons_total_fee: feeCol.c, messages_type: typeCol.c });

    const start = hhmmss(startTime);
    let lessonID;

    if (feeCol.c) {
      const sql = `INSERT INTO lessons (tutorID, studentID, subject, date, startTime, duration, total_fee)
                   VALUES (?, ?, ?, ?, ?, ?, ?)`;
      const params = [tutorID, studentID, subject, date, start, duration, total_fee ?? null];
      console.log('[createLesson] INSERT lessons with total_fee:', { sql, params });
      const [r] = await conn.query(sql, params);
      lessonID = r.insertId;
    } else {
      const sql = `INSERT INTO lessons (tutorID, studentID, subject, date, startTime, duration)
                   VALUES (?, ?, ?, ?, ?, ?)`;
      const params = [tutorID, studentID, subject, date, start, duration];
      console.log('[createLesson] INSERT lessons WITHOUT total_fee:', { sql, params });
      const [r] = await conn.query(sql, params);
      lessonID = r.insertId;
    }

    // Build message
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
      `Start Time: ${start}`,
      `Duration: ${duration} minutes`,
      total_fee != null ? `Total Fee: R ${Number(total_fee).toFixed(2)}` : null,
      `Lesson ID: ${lessonID}`,
    ].filter(Boolean).join('\n');

    if (typeCol.c) {
      const sql = `INSERT INTO messages (senderID, receiverID, subject, body, type)
                   VALUES (?, ?, ?, ?, ?)`;
      const params = [studentID, tutorID, subjectLine, body, 'Lesson Request'];
      console.log('[createLesson] INSERT message with type:', { sql, params });
      await conn.query(sql, params);
    } else {
      const sql = `INSERT INTO messages (senderID, receiverID, subject, body)
                   VALUES (?, ?, ?, ?)`;
      const params = [studentID, tutorID, subjectLine, body];
      console.log('[createLesson] INSERT message WITHOUT type:', { sql, params });
      await conn.query(sql, params);
    }

    await conn.commit();
    console.log('[createLesson] committed, lessonID:', lessonID);
    res.status(201).json({ success: true, lessonID });
  } catch (err) {
    if (conn) { try { await conn.rollback(); } catch (_) {} }
    console.error('createLesson error:', {
      code: err.code,
      sqlState: err.sqlState,
      sqlMessage: err.sqlMessage,
      message: err.message,
      stack: err.stack,
    });
    // Return debug info temporarily to help identify the issue
    return res.status(500).json({
      error: 'Failed to create lesson',
      errorCode: err.code,
      errorDetail: err.sqlMessage || err.message,
    });
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

// ADD: schema debug helper
exports.debugSchema = async (_req, res) => {
  try {
    const [[lFee]] = await pool.query(
      `SELECT COUNT(*) AS c FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'lessons' AND COLUMN_NAME = 'total_fee'`
    );
    const [[mType]] = await pool.query(
      `SELECT COUNT(*) AS c FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'messages' AND COLUMN_NAME = 'type'`
    );
    const [[lessonsCount]] = await pool.query(`SELECT COUNT(*) AS c FROM lessons`);
    const [[tutorsCount]] = await pool.query(`SELECT COUNT(*) AS c FROM tutors`);
    const [[studentsCount]] = await pool.query(`SELECT COUNT(*) AS c FROM students`);
    res.json({
      lessons_total_fee: !!lFee.c,
      messages_type: !!mType.c,
      counts: {
        lessons: lessonsCount.c,
        tutors: tutorsCount.c,
        students: studentsCount.c,
      },
    });
  } catch (err) {
    console.error('debugSchema error:', err);
    res.status(500).json({ error: 'debug failed', detail: err.message });
  }
};