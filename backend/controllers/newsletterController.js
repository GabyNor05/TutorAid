const { Resend } = require('resend');
const pool = require('../config/db');

const resend = new Resend(process.env.RESEND_API_KEY || '');
const FROM = process.env.RESEND_FROM || 'Tutor Aid <onboarding@resend.dev>';

function isValidEmail(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function normalizeEmail(e) {
  return String(e || '').trim().toLowerCase();
}

// Tiny token renderer supporting {{name}} and any provided vars
function renderTemplate(str, vars = {}) {
  if (!str) return '';
  return String(str).replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, k) => {
    const v = vars[k];
    return v === undefined || v === null ? '' : String(v);
  });
}

// Subscribers
exports.listSubscribers = async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, email, status, created_at
       FROM newsletter_subscribers
       ORDER BY created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error('[newsletter:listSubscribers]', err);
    res.status(500).json({ error: 'Failed to fetch subscribers' });
  }
};

exports.subscribe = async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email' });
  }
  try {
    // Upsert subscriber (subscribe or re-subscribe if previously unsubscribed)
    await pool.query(
      `INSERT INTO newsletter_subscribers (email, status)
       VALUES (?, 'subscribed')
       ON DUPLICATE KEY UPDATE status='subscribed'`,
      [email]
    );

    if (!process.env.RESEND_API_KEY) {
      console.log('[newsletter] RESEND_API_KEY missing; accepted without send');
      return res.json({ ok: true, sent: false });
    }

    const displayName = (name || '').trim() || 'there';
    const subject = 'Thanks for subscribing to Tutor Aid';
    const text = `Hi ${displayName},

Thanks for subscribing to the Tutor Aid newsletter!

You’ll now receive occasional emails with:
- Study tips and learning strategies
- Updates on new subjects and tutors
- Exclusive student resources and features

If you ever change your mind, you can unsubscribe from any email.

Warm regards,
Tutor Aid Team`;
    const html = `
      <div style="font-family: Arial, sans-serif; line-height:1.6; color:#222">
        <h2 style="color:#2B5561; margin:0 0 8px">Thanks for subscribing, ${displayName}!</h2>
        <p>Welcome to Tutor Aid. You’ll now receive:</p>
        <ul>
          <li>Study tips and learning strategies</li>
          <li>Updates on new subjects and tutors</li>
          <li>Exclusive student resources and features</li>
        </ul>
        <p style="margin-top:12px">If you ever change your mind, you can unsubscribe from any email.</p>
        <p style="margin-top:16px">Warm regards,<br/>Tutor Aid Team</p>
        <p style="font-size:12px; color:#666; margin-top:12px">© ${new Date().getFullYear()} Tutor Aid</p>
      </div>
    `;

    const { error } = await resend.emails.send({ from: FROM, to: email, subject, text, html });
    if (error) {
      console.error('[newsletter] Resend error:', error);
      return res.json({ ok: true, sent: false });
    }

    return res.json({ ok: true, sent: true });
  } catch (err) {
    console.error('[newsletter] subscribe error:', err);
    return res.status(500).json({ error: 'Failed to process subscription' });
  }
};

exports.unsubscribe = async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  if (!email) return res.status(400).json({ error: 'Email required' });
  try {
    const [r] = await pool.query(
      `UPDATE newsletter_subscribers SET status='unsubscribed' WHERE email=?`,
      [email]
    );
    if (!r.affectedRows) return res.status(404).json({ error: 'Not found' });
    res.json({ ok: true, email });
  } catch (err) {
    console.error('[newsletter:unsubscribe]', err);
    res.status(500).json({ error: 'Failed to unsubscribe' });
  }
};

// Templates
exports.listTemplates = async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, name, type, subject, content_html, content_text, updated_at
       FROM newsletter_templates
       ORDER BY updated_at DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error('[newsletter:listTemplates]', err);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
};

exports.createTemplate = async (req, res) => {
  const { name, type, subject, content_html = '', content_text = '' } = req.body || {};
  if (!name || !subject) return res.status(400).json({ error: 'Name & subject required' });
  try {
    const [ins] = await pool.query(
      `INSERT INTO newsletter_templates (name, type, subject, content_html, content_text)
       VALUES (?, ?, ?, ?, ?)`,
      [name, type || 'General', subject, content_html, content_text]
    );
    res.status(201).json({ id: ins.insertId });
  } catch (err) {
    console.error('[newsletter:createTemplate]', err);
    res.status(500).json({ error: 'Failed to create template' });
  }
};

exports.updateTemplate = async (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid id' });
  const { name, type, subject, content_html = '', content_text = '' } = req.body || {};
  try {
    const [r] = await pool.query(
      `UPDATE newsletter_templates
       SET name=?, type=?, subject=?, content_html=?, content_text=?, updated_at=NOW()
       WHERE id=?`,
      [name, type, subject, content_html, content_text, id]
    );
    if (!r.affectedRows) return res.status(404).json({ error: 'Template not found' });
    res.json({ ok: true });
  } catch (err) {
    console.error('[newsletter:updateTemplate]', err);
    res.status(500).json({ error: 'Failed to update template' });
  }
};

exports.deleteTemplate = async (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid id' });
  try {
    const [r] = await pool.query(`DELETE FROM newsletter_templates WHERE id=?`, [id]);
    if (!r.affectedRows) return res.status(404).json({ error: 'Template not found' });
    res.json({ ok: true });
  } catch (err) {
    console.error('[newsletter:deleteTemplate]', err);
    res.status(500).json({ error: 'Failed to delete template' });
  }
};

// Send (simplified: logs pretend sends)
exports.sendNewsletter = async (req, res) => {
  const { templateId, testEmail, onlySubscribed, emails } = req.body || {};
  if (!templateId) return res.status(400).json({ error: 'templateId required' });
  try {
    const [[tpl]] = await pool.query(
      `SELECT subject, content_html, content_text FROM newsletter_templates WHERE id=? LIMIT 1`,
      [templateId]
    );
    if (!tpl) return res.status(404).json({ error: 'Template not found' });

    let targetEmails = [];
    if (testEmail) {
      targetEmails = [normalizeEmail(testEmail)];
    } else if (Array.isArray(emails) && emails.length) {
      targetEmails = emails.map(normalizeEmail);
    } else if (onlySubscribed) {
      const [rows] = await pool.query(
        `SELECT email FROM newsletter_subscribers WHERE status='subscribed'`
      );
      targetEmails = rows.map(r => normalizeEmail(r.email));
    }

    // Simulate sending (replace with real email provider)
    console.log('[newsletter:send]', {
      templateId,
      count: targetEmails.length,
      subject: tpl.subject
    });

    res.json({ ok: true, sent: targetEmails.length, total: targetEmails.length });
  } catch (err) {
    console.error('[newsletter:sendNewsletter]', err);
    res.status(500).json({ error: 'Failed to send newsletter' });
  }
};