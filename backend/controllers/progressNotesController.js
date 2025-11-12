const cloudinary = require('cloudinary').v2;
const pool = require('../config/db');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Upload (supports memoryStorage or disk)
exports.uploadProgressNote = async (req, res) => {
  const { studentID } = req.body || {};
  const file = req.file;
  if (!file || !studentID) return res.status(400).json({ error: "Missing file or studentID" });

  try {
    let result;
    if (file.buffer && !file.path) {
      result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { resource_type: "raw", folder: "tutoraid/progress-notes" },
          (err, r) => (err ? reject(err) : resolve(r))
        );
        stream.end(file.buffer);
      });
    } else {
      result = await cloudinary.uploader.upload(file.path, {
        resource_type: "raw",
        folder: "tutoraid/progress-notes"
      });
    }

    await pool.query(
      `INSERT INTO progressnotes (studentID, file_path, file_name, mime_type, file_size)
       VALUES (?, ?, ?, ?, ?)`,
      [studentID, result.secure_url, file.originalname, file.mimetype, result.bytes]
    );

    res.status(201).json({ message: "File uploaded", url: result.secure_url });
  } catch (err) {
    console.error('[uploadProgressNote] error:', err.message || err);
    res.status(500).json({ error: "Failed to save file info" });
  }
};

// List notes by student
exports.getNotesByStudentID = async (req, res) => {
  const studentID = Number(req.params.studentID);
  if (!studentID) return res.status(400).send('Invalid studentID');
  try {
    const [rows] = await pool.query(
      `SELECT noteID, studentID, file_path, file_name, mime_type, uploaded_at, file_size
       FROM progressnotes
       WHERE studentID = ?
       ORDER BY uploaded_at DESC`,
      [studentID]
    );
    // Normalize (provide file_url alias for frontend compatibility)
    const data = rows.map(r => ({
      noteID: r.noteID,
      studentID: r.studentID,
      file_url: r.file_path,
      file_path: r.file_path,
      file_name: r.file_name,
      mime_type: r.mime_type,
      uploaded_at: r.uploaded_at,
      file_size: r.file_size
    }));
    res.json(data);
  } catch (err) {
    console.error('[getNotesByStudentID] error:', err.sqlMessage || err.message);
    res.status(500).json({ error: "Failed to fetch notes" });
  }
};

// Backwards compatible alias (frontend might call /student/:id expecting getByStudent)
exports.getByStudent = exports.getNotesByStudentID;

// Publish (only if a published column exists; otherwise return 400)
async function hasPublishedColumn() {
  const [rows] = await pool.query(
    `SELECT COLUMN_NAME FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'progressnotes'
       AND COLUMN_NAME = 'published' LIMIT 1`
  );
  return rows.length === 1;
}

exports.publish = async (req, res) => {
  const id = Number(req.body?.noteID ?? req.params.noteID);
  if (!id) return res.status(400).send('noteID required');
  try {
    if (!(await hasPublishedColumn())) {
      return res.status(400).send('published column not present');
    }
    const [r] = await pool.query('UPDATE progressnotes SET published = 1 WHERE noteID = ?', [id]);
    if (r.affectedRows === 0) return res.status(404).send('Note not found');
    res.json({ ok: true });
  } catch (err) {
    console.error('[publish] error:', err.sqlMessage || err.message);
    res.status(500).send(err.sqlMessage || err.message);
  }
};

// Unified publish helpers (kept for existing routes but adapted to schema)
exports.publishByBody = async (req, res) => {
  const id = Number(req.body?.noteID);
  if (!id) return res.status(400).send('noteID required');
  try {
    if (!(await hasPublishedColumn())) return res.status(400).send('published column not present');
    const [r] = await pool.query('UPDATE progressnotes SET published = 1 WHERE noteID = ?', [id]);
    if (r.affectedRows === 0) return res.status(404).send('Note not found');
    res.json({ success: true, noteID: id });
  } catch (err) {
    console.error('[publishByBody] error:', err.sqlMessage || err.message);
    res.status(500).send('Failed to publish note');
  }
};

exports.publishById = async (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).send('Invalid id');
  try {
    if (!(await hasPublishedColumn())) return res.status(400).send('published column not present');
    const [r] = await pool.query('UPDATE progressnotes SET published = 1 WHERE noteID = ?', [id]);
    if (r.affectedRows === 0) return res.status(404).send('Note not found');
    res.json({ success: true, noteID: id });
  } catch (err) {
    console.error('[publishById] error:', err.sqlMessage || err.message);
    res.status(500).send('Failed to publish note');
  }
};