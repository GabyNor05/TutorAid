const pool = require('../config/db');

// Plain-text error helper (consistent with your controllers)
function errMsg(err, fb = 'Error') {
  return (err && (err.sqlMessage || err.message)) || fb;
}
function sendErr(res, err, status = 500, fb) {
  console.error('[feedback]', { code: err?.code, msg: err?.message, sql: err?.sqlMessage, stack: err?.stack });
  return res.status(status).send(errMsg(err, fb));
}

exports.create = async (req, res) => {
  try {
    const { userID = null, email = null, category, rating, comment, page = null, userAgent = null } = req.body || {};
    if (!category || !rating || !comment) return res.status(400).send('category, rating and comment are required');
    const r = Math.max(1, Math.min(5, parseInt(rating, 10)));

    const [result] = await pool.query(
      `INSERT INTO feedback (userID, email, category, rating, comment, page, userAgent)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userID || null, email || null, String(category).trim(), r, String(comment).trim(), page || null, userAgent || null]
    );

    return res.status(201).json({ ok: true, feedbackID: result.insertId });
  } catch (err) {
    return sendErr(res, err, 500, 'Failed to submit feedback');
  }
};

exports.list = async (req, res) => {
  try {
    const { status } = req.query || {};
    const params = [];
    let where = '';
    if (status) { where = 'WHERE f.status = ?'; params.push(status); }

    const [rows] = await pool.query(
      `SELECT
         f.feedbackID,
         f.userID,
         f.category,
         f.rating,
         f.comment,
         f.email,
         f.page,
         f.status,
         f.created_at,
         u.name AS userName
       FROM feedback f
       LEFT JOIN users u ON u.userID = f.userID
       ${where}
       ORDER BY f.created_at DESC`,
      params
    );
    res.json(rows);
  } catch (e) {
    res.status(500).send(e.sqlMessage || e.message || 'Failed to fetch feedback');
  }
};

exports.updateStatus = async (req, res) => {
  const id = Number(req.params.id);
  const { status } = req.body || {};
  if (!id || !status) return res.status(400).send('id and status required');
  try {
    const [r] = await pool.query('UPDATE feedback SET status = ? WHERE feedbackID = ?', [status, id]);
    if (r.affectedRows === 0) return res.status(404).send('Feedback not found');
    res.json({ success: true });
  } catch (e) {
    res.status(500).send(e.sqlMessage || e.message || 'Failed to update status');
  }
};

exports.remove = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).send('id required');

    const [r] = await pool.query(`DELETE FROM feedback WHERE feedbackID = ?`, [id]);
    if (r.affectedRows === 0) return res.status(404).send('Feedback not found');

    return res.json({ ok: true });
  } catch (err) {
    return sendErr(res, err, 500, 'Failed to delete feedback');
  }
};