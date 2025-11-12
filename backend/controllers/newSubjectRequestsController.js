const pool = require('../config/db');

async function tableExists(name) {
  const [rows] = await pool.query(
    `SELECT TABLE_NAME FROM information_schema.TABLES
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? LIMIT 1`, [name]
  );
  return rows.length === 1;
}

exports.create = async (req, res) => {
  const { subjectName, subjectDescription, dateRequested } = req.body || {};
  if (!subjectName) return res.status(400).json({ error: 'subjectName required' });

  try {
    // 1) Ensure subject exists in subjects table
    let subjectID = null;
    if (await tableExists('subjects')) {
      const [[found]] = await pool.query(
        'SELECT subjectID FROM subjects WHERE LOWER(name) = LOWER(?) LIMIT 1',
        [subjectName]
      );
      if (found) {
        subjectID = found.subjectID;
      } else {
        const [ins] = await pool.query(
          'INSERT INTO subjects (name, description) VALUES (?, ?)',
          [subjectName, subjectDescription || null]
        );
        subjectID = ins.insertId;
      }
    }

    // 2) Store the request (if a request table exists)
    let requestID = null;
    const reqTable =
      (await tableExists('new_subject_requests')) ? 'new_subject_requests' :
      (await tableExists('newSubjectRequests')) ? 'newSubjectRequests' :
      null;

    if (reqTable) {
      const [ins2] = await pool.query(
        `INSERT INTO ${reqTable} (subjectName, subjectDescription, dateRequested, subjectID)
         VALUES (?, ?, ?, ?)`,
        [subjectName, subjectDescription || null, dateRequested || new Date(), subjectID]
      );
      requestID = ins2.insertId;
    }

    return res.status(201).json({
      message: 'Stored',
      subjectID,
      requestID
    });
  } catch (err) {
    return res.status(500).json({ error: err.sqlMessage || err.message || 'Failed to store new subject request' });
  }
};