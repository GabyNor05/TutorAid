const pool = require('../config/db');

exports.getAllStudents = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT s.*, u.name, u.image
            FROM students s
            LEFT JOIN users u ON s.userID = u.userID
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch students" });
    }
};

exports.getStudentByUserID = async (req, res) => {
    const { userID } = req.params;
    try {
        const [rows] = await pool.query(
            `SELECT s.*, u.name, u.image
             FROM students s
             LEFT JOIN users u ON s.userID = u.userID
             WHERE s.userID = ?`,
            [userID]
        );
        if (rows.length > 0) {
            res.json(rows[0]);
        } else {
            res.status(404).json({ error: "Student not found" });
        }
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch student" });
    }
};

exports.getAllStatuses = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT DISTINCT status FROM Students');
        const statuses = rows.map(row => row.status).filter(Boolean);
        res.json(statuses);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch statuses" });
    }
};

exports.createStudentRequest = async (req, res) => {
    const { userID, status } = req.body;
    try {
        await pool.query(
            `INSERT INTO students (userID, status)
             VALUES (?, ?)`,
            [userID, status]
        );
        res.status(201).json({ message: "Request submitted successfully" });
    } catch (err) {
        console.error("Error in createStudentRequest:", err);
        res.status(500).json({ error: "Failed to submit request" });
    }
};

exports.getStudentIDByUserID = async (req, res) => {
    const { userID } = req.params;
    try {
        const [rows] = await pool.query(
            `SELECT studentID FROM students WHERE userID = ?`,
            [userID]
        );
        if (rows.length > 0) {
            res.json({ studentID: rows[0].studentID });
        } else {
            res.status(404).json({ error: "Student not found" });
        }
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch studentID" });
    }
};

exports.saveStudentProfile = async (req, res) => {
  const { userID } = req.params;
  const { grade = '', school = '', address = '', city = '', province = '', status = 'Active' } = req.body;

  try {
    // ensure user exists
    const [u] = await pool.query('SELECT userID FROM users WHERE userID = ?', [userID]);
    if (!u.length) return res.status(404).json({ error: 'User not found' });

    // insert or update
    const [rows] = await pool.query('SELECT studentID FROM students WHERE userID = ?', [userID]);
    if (rows.length) {
      await pool.query(
        `UPDATE students
         SET grade = ?, school = ?, address = ?, city = ?, province = ?, status = ?
         WHERE userID = ?`,
        [grade, school, address, city, province, status, userID]
      );
    } else {
      await pool.query(
        `INSERT INTO students (userID, grade, school, address, city, province, status)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [userID, grade, school, address, city, province, status]
      );
    }
    res.json({ ok: true, userID: Number(userID) });
  } catch (err) {
    console.error('saveStudentProfile error:', err);
    res.status(500).json({ error: 'Failed to save student profile' });
  }
};

exports.getByUser = async (req, res) => {
  try {
    const { userID } = req.params;
    const [[row]] = await pool.query(
      'SELECT studentID, userID FROM students WHERE userID = ? LIMIT 1',
      [userID]
    );
    if (!row) return res.status(404).json({ error: 'Student not found' });
    res.json(row);
  } catch (err) {
    console.error('[students:getByUser] error:', err);
    res.status(500).json({ error: 'Failed to fetch student' });
  }
};