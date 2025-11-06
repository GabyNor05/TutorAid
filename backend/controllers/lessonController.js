const nodemailer = require('nodemailer'); // For sending emails
const pool = require('../config/db'); // ensure this is present

// Helper: log and send plain-text error
function errorMessage(err, fallback = 'An error occurred') {
  return (err && (err.sqlMessage || err.message)) || fallback;
}
function sendError(res, err, status = 500, fallback) {
  console.error('[LessonController] error:', {
    code: err?.code,
    sqlState: err?.sqlState,
    sqlMessage: err?.sqlMessage,
    message: err?.message,
    stack: err?.stack,
  });
  return res.status(status).send(errorMessage(err, fallback));
}

function normTime(t) {
  if (!t) return t;
  return /^\d{2}:\d{2}(:\d{2})?$/.test(t) ? (t.length === 5 ? `${t}:00` : t) : t;
}

exports.createLesson = async (req, res) => {
  const payload = req.body || {};
  let { tutorID, studentID, subject, date, startTime, duration, total_fee } = payload;

  console.log('[createLesson] payload:', payload);

  if (!tutorID || !studentID || !subject || !date || !startTime || !duration) {
    return res.status(400).send('Missing required fields'); // plain text
  }

  // Coerce numeric IDs
  tutorID = Number(tutorID);
  const incomingSID = Number(studentID);

  let conn;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();

    // Tutor exists
    const [[tutorChk]] = await conn.query(
      `SELECT COUNT(*) AS c FROM tutors WHERE tutorID = ?`,
      [tutorID]
    );
    if (!tutorChk.c) throw new Error('Invalid tutorID');

    // Resolve student by either students.studentID or users.userID
    const [[studRow]] = await conn.query(
      `SELECT studentID, userID FROM students WHERE studentID = ? OR userID = ? LIMIT 1`,
      [incomingSID, incomingSID]
    );
    if (!studRow) throw new Error('Invalid studentID');

    // Prefer students.studentID
    const preferredStudentID = Number(studRow.studentID);
    const userIdForFallback = Number(studRow.userID);

    const time = normTime(startTime);
    let lessonID;

    const doInsert = async (sidForInsert, withTotal = true) => {
      if (withTotal) {
        const [r] = await conn.query(
          `INSERT INTO lessons (tutorID, studentID, subject, date, startTime, duration, total_fee)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [tutorID, sidForInsert, subject, date, time, duration, total_fee ?? null]
        );
        return r.insertId;
      } else {
        const [r2] = await conn.query(
          `INSERT INTO lessons (tutorID, studentID, subject, date, startTime, duration)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [tutorID, sidForInsert, subject, date, time, duration]
        );
        return r2.insertId;
      }
    };

    try {
      // 1) Try with students.studentID
      try {
        lessonID = await doInsert(preferredStudentID, true);
      } catch (e) {
        if (e.code === 'ER_BAD_FIELD_ERROR' || e.code === 'ER_NO_DEFAULT_FOR_FIELD') {
          console.warn('[createLesson] retrying without total_fee due to:', e.code);
          lessonID = await doInsert(preferredStudentID, false);
        } else {
          throw e;
        }
      }
    } catch (e) {
      // 2) Fallback only if FK targets users(userID)
      const looksLikeUsersFK =
        e.code === 'ER_NO_REFERENCED_ROW_2' &&
        typeof e.sqlMessage === 'string' &&
        e.sqlMessage.toLowerCase().includes('references') &&
        e.sqlMessage.toLowerCase().includes('users') &&
        e.sqlMessage.toLowerCase().includes('userid');

      if (looksLikeUsersFK && userIdForFallback) {
        try {
          try {
            lessonID = await doInsert(userIdForFallback, true);
          } catch (e2) {
            if (e2.code === 'ER_BAD_FIELD_ERROR' || e2.code === 'ER_NO_DEFAULT_FOR_FIELD') {
              console.warn('[createLesson] usersFK: retrying without total_fee due to:', e2.code);
              lessonID = await doInsert(userIdForFallback, false);
            } else {
              throw e2;
            }
          }
        } catch (finalErr) {
          throw finalErr;
        }
      } else {
        throw e;
      }
    }

    await conn.commit();
    console.log('[createLesson] committed:', { lessonID });
    return res.status(201).json({ success: true, lessonID });
  } catch (err) {
    if (conn) { try { await conn.rollback(); } catch (e) { console.error('rollback failed', e); } }
    return sendError(res, err, 500, 'Failed to create lesson'); // plain text error
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
    return sendError(res, err, 500, 'Failed to fetch lessons');
  }
};

exports.updateLessonStatus = async (req, res) => {
  const pool = require('../config/db');
  const { lessonID, status } = req.body;
  try {
    if (!lessonID || !status) return res.status(400).send('lessonID and status are required');
    await pool.query(
      `UPDATE lessons SET status = ? WHERE lessonID = ?`,
      [status, lessonID]
    );
    res.json({ message: "Lesson status updated!" });
  } catch (err) {
    return sendError(res, err, 500, 'Failed to update lesson status');
  }
};

exports.deleteLesson = async (req, res) => {
  const pool = require('../config/db');
  const { lessonID, studentEmail } = req.body;
  try {
    if (!lessonID) return res.status(400).send('lessonID is required');
    await pool.query(`DELETE FROM lessons WHERE lessonID = ?`, [lessonID]);

    // Send cancellation email (keep message section)
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: studentEmail,
        subject: "Lesson Cancelled",
        text: "Your lesson has been cancelled by the tutor."
      });
    } catch (mailErr) {
      console.error('deleteLesson mail error:', mailErr);
      // continue; email failure should not fail API after delete
    }

    res.json({ message: "Lesson deleted and email sent!" });
  } catch (err) {
    return sendError(res, err, 500, 'Failed to delete lesson');
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
    return sendError(res, err, 500, 'Failed to fetch accepted lessons');
  }
};